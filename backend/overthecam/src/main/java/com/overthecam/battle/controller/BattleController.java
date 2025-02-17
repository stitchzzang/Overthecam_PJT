package com.overthecam.battle.controller;

import com.overthecam.battle.dto.*;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.service.BattleService;
import com.overthecam.battle.service.LiveKitTokenService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.dto.ErrorResponse;
import com.overthecam.security.util.SecurityUtils;
import livekit.LivekitWebhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONException;
import org.json.JSONObject;
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

    private final LiveKitTokenService liveKitTokenService;
    private final BattleService battleService;
    private final SecurityUtils securityUtils;

    /**
     * 새로운 배틀방을 생성하고 접근 토큰을 발급합니다.
     */
    @PostMapping("/room")
    public ResponseEntity<CommonResponseDto<?>> createBattleRoom(
        @RequestBody Map<String, String> params,
        Authentication authentication) {
        String roomName = params.get("roomName");
        String participantName = params.get("participantName");

        if (roomName == null || participantName == null) {
            return ResponseEntity.ok(
                CommonResponseDto.error(
                    ErrorResponse.of(BattleErrorCode.MISSING_REQUIRED_FIELD)
                )
            );
        }

        try {
            Long userId = securityUtils.getCurrentUserId(authentication);
            BattleRoomResponse response = battleService.createBattleRoom(userId, roomName, participantName);

            return ResponseEntity.ok(CommonResponseDto.ok(Map.of(
                "battleId", response.getBattleId(),
                "token", response.getToken(),
                "roomName", response.getRoomName()
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
     */
    @PostMapping("/room/{battleId}/join")
    public ResponseEntity<CommonResponseDto<?>> joinBattleRoom(
        @PathVariable(name = "battleId") Long battleId,
        @RequestBody Map<String, String> params,
        Authentication authentication) {
        String participantName = params.get("participantName");

        if (participantName == null) {
            return ResponseEntity.ok(
                CommonResponseDto.error(
                    ErrorResponse.of(BattleErrorCode.MISSING_REQUIRED_FIELD)
                )
            );
        }

        try {
            Long userId = securityUtils.getCurrentUserId(authentication);
            BattleRoomResponse response = battleService.joinBattleRoom(battleId, userId, participantName);

            return ResponseEntity.ok(CommonResponseDto.ok(Map.of(
                "token", response.getToken(),
                "battleId", response.getBattleId(),
                "roomName", response.getRoomName()
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
     * 배틀방 나가기
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
     * LiveKit 웹훅 처리
     */
    @PostMapping(value = "/livekit/webhook", consumes = "application/webhook+json")
    public ResponseEntity<CommonResponseDto<?>> handleWebhook(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody String body) {
        try {
            log.info("웹훅 이벤트 수신: {}", body);
            LivekitWebhook.WebhookEvent event = liveKitTokenService.handleWebhookEvent(authHeader, body);
            log.info("파싱된 웹훅 이벤트: {}", event);

            if (event.getEvent().equals("participant_left")) {
                if (event.getParticipant() == null || event.getParticipant().getMetadata() == null) {
                    log.error("이벤트에서 참가자 정보 또는 메타데이터 누락");
                    return ResponseEntity.ok(CommonResponseDto.error(
                            ErrorResponse.of(BattleErrorCode.INVALID_WEBHOOK_DATA)
                    ));
                }

                try {
                    JSONObject metadata = new JSONObject(event.getParticipant().getMetadata());
                    Long userId = metadata.getLong("userId");
                    Long battleId = metadata.getLong("battleId");

                    log.info("참가자 퇴장 이벤트 처리 시작 - 배틀ID: {}, 사용자ID: {}", battleId, userId);
                    battleService.handleUserLeave(battleId, userId);
                    log.info("참가자 퇴장 이벤트 처리 완료");

                    return ResponseEntity.ok(CommonResponseDto.ok(Map.of(
                            "message", "웹훅 이벤트가 성공적으로 처리되었습니다",
                            "event", event.toString()
                    )));
                } catch (JSONException e) {
                    log.error("메타데이터 파싱 실패: {}", event.getParticipant().getMetadata(), e);
                    return ResponseEntity.ok(CommonResponseDto.error(
                            ErrorResponse.of(BattleErrorCode.INVALID_METADATA_FORMAT)
                    ));
                }
            } else {
                log.info("participant_left 외 다른 이벤트 수신: {}", event.getEvent());
            }

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
     * 모든 배틀방 조회
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
     * 랜덤 주제 생성
     */
    @GetMapping("/random")
    public CommonResponseDto<RandomVoteTopicResponse> createRandomVoteTopic() {
        RandomVoteTopicResponse response = battleService.createRandomVoteTopic();
        log.info("랜덤 주제 생성 완료");
        return CommonResponseDto.ok(response);
    }
}