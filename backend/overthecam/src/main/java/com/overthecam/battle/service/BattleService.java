package com.overthecam.battle.service;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.dto.BattleCreateRequest;
import com.overthecam.battle.dto.BattleResponse;
import com.overthecam.battle.dto.BattleStartResponse;
import com.overthecam.battle.dto.ParticipantSessionInfo;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BattleService {

    private final OpenViduService openViduService;
    private final BattleRepository battleRepository;
    private final BattleParticipantRepository battleParticipantRepository;

    /**
     * 배틀 방을 생성하고 방장을 등록하는 메서드
     */
    public BattleResponse createBattleRoom(BattleCreateRequest request, String authToken) throws OpenViduJavaClientException, OpenViduHttpException {

        // 1. 토큰으로 사용자 인증 확인
        // User user = userService.validateUser(authToken);

        // 2. OpenVidu 세션 생성
        Session session = openViduService.createSession();
        String sessionId = session.getSessionId();

        // 3. 배틀방 생성
        Battle battle = Battle.builder()
                .title(request.getTitle())
                .sessionId(sessionId)
                .status(0)  // WAITING 상태
                .roomUrl("https://1dan2gulro.hapsida~~")
                .thumbnailUrl("https://d26tym50939cjl.cloudfront.net/frame1.png")
                .build();

        Battle savedBattle = battleRepository.save(battle);

        // 4. 방장 등록
        BattleParticipant host = BattleParticipant.builder()
                .battle(savedBattle)
                //.user(user)
                .role(ParticipantRole.HOST)   // 방장 역할만 부여
                .build();

        battleParticipantRepository.save(host);


        // 5. OpenVidu 토큰 생성
        String connectionToken = openViduService.createConnection(sessionId);


        return BattleResponse.builder()
                .battleId(savedBattle.getId()) //배틀방 번호
                .title(savedBattle.getTitle()) //방제
                .sessionId(sessionId) //세션 ID
                .connectionToken(connectionToken) //사용자별 고유한 TOKEN
                .roomUrl(savedBattle.getRoomUrl()) //방 초대 url
                .build();

    } //여기까지가 처음에 방이 생성되고 방장의 role만 설정된 상태


    /**
     * 배틀방 참가 메서드
     */
    public BattleResponse joinBattle(Long battleId, String authToken) throws OpenViduJavaClientException, OpenViduHttpException {

        // 1. 배틀방 조회
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("배틀방을 찾을 수 없습니다"));

        // 2. 방 상태 확인
        if (battle.getStatus() == 1) {  // 진행중 상태
            throw new RuntimeException("이미 시작된 배틀입니다");
        }

        // 3. 현재 참가자 수 확인
        long participantCount = battleRepository.countUsersByBattleId(battleId);
        if (participantCount >= 6) {
            throw new RuntimeException("방이 가득 찼습니다");
        }

        // 4. 참가자로 등록 (PARTICIPANT = 2)
        BattleParticipant participant = BattleParticipant.builder()
                .id(battleId)
                //.user(user)
                .role(ParticipantRole.PARTICIPANT)
                .build();

        battleParticipantRepository.save(participant);

        // 5. 참가자수 증가
        battle.updateTotalUsers(battle.getTotalUsers() + 1);
        battleRepository.save(battle);

        // 6. OpenVidu 토큰 생성 (비디오/오디오 OFF 상태)
        String connectionToken = openViduService.createConnection(battle.getSessionId());

        return BattleResponse.builder()
                .battleId(battle.getId())
                .title(battle.getTitle())
                .sessionId(battle.getSessionId())
                .connectionToken(connectionToken)
                .roomUrl(battle.getRoomUrl())
                .build();

    } //여기까지가 배틀방이 생성된 후에 6명의 참가자가 모이는 상태

    /**
     * 배틀러 선정 및 배틀 시작 메서드
     */
    public BattleStartResponse selectBattlersAndStart(Long battleId, List<Long> selectedBattlerIds) throws OpenViduJavaClientException, OpenViduHttpException {
        // 1. 배틀방 조회
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("배틀방을 찾을 수 없습니다"));

        // 2. 현재 방의 모든 참가자 조회
        List<BattleParticipant> participants = battleParticipantRepository.findAllByBattleId(battleId);

        // 3. 배틀러 선정 (2명만 선택되었는지 체크)
        if (selectedBattlerIds.size() != 2) {
            throw new RuntimeException("배틀러는 2명만 선택해야 합니다");
        }

        // 4. 배틀러로 지정된 참가자 role 업데이트
        for (BattleParticipant participant : participants) {
            if (selectedBattlerIds.contains(participant.getUserId())) {
                int newRole;
                if (participant.getRole() == ParticipantRole.HOST) {
                    newRole = ParticipantRole.HOST | ParticipantRole.BATTLER; // 5: 방장+배틀러
                } else {
                    newRole = ParticipantRole.PARTICIPANT | ParticipantRole.BATTLER; // 6: 참가자+배틀러
                }
                participant.updateRole(newRole);
                battleParticipantRepository.save(participant);
            }
        }

        // 4. 배틀 상태를 진행중으로 변경
        battle.updateStatus(1);
        battleRepository.save(battle);


        // 6. 모든 참가자의 세션 정보 생성 (배틀러는 비디오/오디오 ON 가능, 나머지는 OFF)
        List<ParticipantSessionInfo> sessionInfos = new ArrayList<>();
        for (BattleParticipant participant : participants) {
            String connectionToken;
            // 배틀러인 경우 PUBLISHER 권한으로 토큰 생성
            if ((participant.getRole() & ParticipantRole.BATTLER) != 0) {
                connectionToken = openViduService.createPublisherConnection(battle.getSessionId());
            } else {
                // 일반 참가자는 SUBSCRIBER 권한으로 토큰 생성
                connectionToken = openViduService.createConnection(battle.getSessionId());
            }

            sessionInfos.add(new ParticipantSessionInfo(
                    participant.getUserId(),
                    participant.getRole(),
                    battle.getSessionId(),
                    connectionToken
            ));
        }

        return new BattleStartResponse(battleId, battle.getSessionId(), sessionInfos);

    }

}
