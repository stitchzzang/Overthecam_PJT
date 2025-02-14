package com.overthecam.battle.controller;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.dto.BattleRoomAllResponse;
import com.overthecam.battle.dto.RandomVoteTopicResponse;
import com.overthecam.battle.dto.SelectBattlerResponse;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.battle.service.BattleService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.dto.ErrorResponse;
import com.overthecam.security.util.SecurityUtils;
import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.WebhookReceiver;
import livekit.LivekitWebhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 배틀(대결방) 관련 컨트롤러
 * LiveKit를 이용한 화상 통화 기능과 배틀 진행을 관리합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/battle")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BattleController {

    private final BattleService battleService;
    private final BattleRepository battleRepository;
    private final UserRepository userRepository;
    private final BattleParticipantRepository battleParticipantRepository;
    private final SecurityUtils securityUtils;

    @Value("${livekit.api.key}")
    private String livekitApiKey;
    @Value("${livekit.api.secret}")
    private String livekitApiSecret;

    /**
     * 새로운 배틀방을 생성하고 접근 토큰을 발급합니다.
     *
     * @param params         roomName(방 제목)과 participantName(참가자 이름)을 포함하는 Map
     * @param authentication Spring Security 인증 객체
     * @return 생성된 토큰과 배틀방 정보를 포함한 CommonResponseDto
     */
    @PostMapping("/room")
    public ResponseEntity<CommonResponseDto<?>> createBattleRoom(
            @RequestBody Map<String, String> params,
            Authentication authentication) {

        String roomName = params.get("roomName");
        String participantName = params.get("participantName");

        // 현재 인증된 사용자의 ID 가져오기
        Long userId = securityUtils.getCurrentUserId(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (roomName == null || participantName == null) {
            return ResponseEntity.ok(
                    CommonResponseDto.error(
                            ErrorResponse.of(BattleErrorCode.MISSING_REQUIRED_FIELD) // 필수 값 누락 오류
                    )
            );
        }

        try {

            // Metadata 객체 생성 (JSON 형태)
            JSONObject metadata = new JSONObject();
            metadata.put("role", "host"); // 예: host, participant 등 역할 지정
            // LiveKit 토큰 생성
            AccessToken token = new AccessToken(livekitApiKey, livekitApiSecret);
            token.setName(participantName);
            token.setIdentity(participantName);
            // Metadata 설정
            token.setMetadata(metadata.toString());
            token.addGrants(new RoomJoin(true), new RoomName(roomName));
            String tokenStr = token.toJwt();

            // 배틀방 생성
            Battle battle = Battle.builder()
                    .title(roomName)
                    .roomUrl("roomurl:roomurl")
                    .thumbnailUrl("https://d26tym50939cjl.cloudfront.net/thumbnails/thumbnail+1.png")
                    .totalUsers(1)
                    .status(Status.WAITING)  // 초기 상태 설정
                    .build();
            Battle savedBattle = battleRepository.save(battle);

            // 방장 등록
            BattleParticipant host = BattleParticipant.builder()
                    .battle(savedBattle)
                    .user(user)
                    .role(ParticipantRole.HOST)
                    .build();
            battleParticipantRepository.save(host);

            return ResponseEntity.ok(CommonResponseDto.ok(Map.of(
                    "battleId", savedBattle.getId(),
                    "token", tokenStr,
                    "roomName", roomName
            )));
        } catch (Exception e) {
            log.error("배틀방 생성 실패", e);
            return ResponseEntity.ok(
                    CommonResponseDto.error(
                            ErrorResponse.of(BattleErrorCode.BATTLE_ROOM_READ_FAILED)
                    )
            );
        }
    }

    /**
     * 배틀방 참가 토큰을 발급합니다.
     *
     * @param battleId       참가할 배틀방 ID
     * @param authentication 참가자 정보
     * @return 발급된 토큰 정보
     */
    @PostMapping("/room/{battleId}/join")
    public ResponseEntity<CommonResponseDto<?>> joinBattleRoom(
            @PathVariable(name = "battleId") Long battleId,
            @RequestBody Map<String, String> params,
            Authentication authentication) {

        String participantName = params.get("participantName"); // 참가자의 이름을 요청에서 받음

        if (participantName == null) {
            return ResponseEntity.ok(
                    CommonResponseDto.error(
                            ErrorResponse.of(BattleErrorCode.MISSING_REQUIRED_FIELD) // 필수 값 누락 오류
                    )
            );
        }

        try {
            // 현재 인증된 사용자의 ID 가져오기
            Long userId = securityUtils.getCurrentUserId(authentication);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 배틀방 정보 조회
            Battle battle = battleRepository.findById(battleId)
                    .orElseThrow(() -> new RuntimeException("Battle not found"));

            // LiveKit 토큰 생성
            AccessToken token = new AccessToken(livekitApiKey, livekitApiSecret);
            token.setName(participantName);
            token.setIdentity(participantName);
            token.addGrants(new RoomJoin(true), new RoomName(battle.getTitle()));
            String tokenStr = token.toJwt();

            // 참가자 등록 (방장이 아닌 일반 참가자로 설정)
            BattleParticipant participant = BattleParticipant.builder()
                    .battle(battle)
                    .user(user)
                    .role(ParticipantRole.PARTICIPANT) // 일반 참가자로 설정
                    .build();
            battleParticipantRepository.save(participant);

            // 참가자 수 증가
            battle.updateTotalUsers(battle.getTotalUsers() + 1);
            battleRepository.save(battle);

            return ResponseEntity.ok(CommonResponseDto.ok(Map.of(
                    "token", tokenStr,
                    "battleId", battleId,
                    "roomName", battle.getTitle()
            )));
        } catch (Exception e) {
            log.error("배틀방 참가 실패", e);
            return ResponseEntity.ok(
                    CommonResponseDto.error(
                            ErrorResponse.of(BattleErrorCode.BATTLE_NOT_FOUND)
                    )
            );
        }
    }


    /**
     * 배틀러 선정 API
     * 두 명의 참가자를 배틀러로 선정합니다.
     *
     * @param battleId 배틀방 ID
     * @param battler1 첫 번째 배틀러의 user_id
     * @param battler2 두 번째 배틀러의 user_id
     * @return 선정된 배틀러 정보
     */
    @GetMapping("/room/{battleId}/start/{battler1}/{battler2}")
    public ResponseEntity<CommonResponseDto<SelectBattlerResponse>> startBattle(
            @PathVariable(name = "battleId") Long battleId,
            @PathVariable(name = "battler1") String battler1,
            @PathVariable(name = "battler2") String battler2) {
        try {
            SelectBattlerResponse response = battleService.selectBattlers(battleId, battler1, battler2);
            return ResponseEntity.ok(CommonResponseDto.ok(response));
        } catch (Exception e) {
            log.error("배틀러 선정 실패", e);
            return ResponseEntity.ok(
                    CommonResponseDto.error(
                            ErrorResponse.of(BattleErrorCode.BATTLE_NOT_FOUND)
                    )
            );
        }
    }


    /**
     * 배틀방 나가기 메서드
     */
    @DeleteMapping("/room/{battleId}/leave")
    public ResponseEntity<CommonResponseDto<?>> leaveBattleRoom(
            @PathVariable(name = "battleId") Long battleId,
            Authentication authentication) {
        try {
            Long userId = securityUtils.getCurrentUserId(authentication);
            battleService.handleUserLeave(battleId, userId);
            return ResponseEntity.ok(CommonResponseDto.ok(Map.of(
                    "message", "성공적으로 퇴장하였습니다."
            )));
        } catch (Exception e) {
            log.error("배틀방 퇴장 실패", e);
            return ResponseEntity.ok(
                    CommonResponseDto.error(
                            ErrorResponse.of(BattleErrorCode.BATTLE_NOT_FOUND)
                    )
            );
        }
    }


    /**
     * LiveKit 웹훅 이벤트를 처리합니다.
     *
     * @param authHeader LiveKit로부터 전송된 인증 헤더
     * @param body       웹훅 이벤트 내용
     * @return 이벤트 처리 결과
     */
    @PostMapping(value = "/livekit/webhook", consumes = "application/webhook+json")
    public ResponseEntity<CommonResponseDto<?>> handleWebhook(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody String body) {

        try {
            WebhookReceiver webhookReceiver = new WebhookReceiver(livekitApiKey, livekitApiSecret);
            LivekitWebhook.WebhookEvent event = webhookReceiver.receive(body, authHeader);

            return ResponseEntity.ok(CommonResponseDto.ok(Map.of(
                    "message", "웹훅 이벤트가 성공적으로 처리되었습니다",
                    "event", event.toString()
            )));
        } catch (Exception e) {
            log.error("웹훅 처리 실패", e);
            return ResponseEntity.ok(
                    CommonResponseDto.error(
                            ErrorResponse.of(BattleErrorCode.OPENVIDU_CONNECTION_ERROR)
                    )
            );
        }
    }

    /**
     * 배틀방 조화하기
     * 총 배틀시간. 참여자수, 진행여부 등에 관한 모든 걸 리턴한다.
     */
    @GetMapping("/room/all")
    public CommonResponseDto<BattleRoomAllResponse> getAllBattleRooms() {
        try {
            BattleRoomAllResponse response = battleService.getAllBattleRooms();
            return CommonResponseDto.ok(response);
        } catch (Exception e) {
            return CommonResponseDto.error(ErrorResponse.of(BattleErrorCode.BATTLE_ROOM_READ_FAILED));
        }
    }

    /**
     * 랜덤 주제 생성 API
     */
    @GetMapping("/random")
    public CommonResponseDto<RandomVoteTopicResponse> createRandomVoteTopic() {
        RandomVoteTopicResponse response = battleService.createRandomVoteTopic();
        return CommonResponseDto.ok(response);
    }

}