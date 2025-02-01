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
     * 배틀러 선정 및 배틀 시작 메서드
     */
    public BattleStartResponse selectBattlersAndStart(Long battleId, List<Long> selectedBattlerIds) throws OpenViduJavaClientException, OpenViduHttpException {
        // 1. 배틀방 조회
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("배틀방을 찾을 수 없습니다"));


        // 2. 현재 방의 모든 참가자 조회 (방 번호로 조회)
        List<BattleParticipant> participants = battleParticipantRepository.findAllByBattleId(battleId);

        // 3. 배틀러로 지정된 탐가들을 배틀러로 업데이트
        for (BattleParticipant participant : participants) {
            // 3.1. 선택된 배틀러 ID들을 받아서
            if (selectedBattlerIds.contains(participant.getUser().getId())) {
                int newRole;
                if (participant.getRole() == ParticipantRole.HOST) {
                    // 3.2. 해당 사용자들의 role을 배틀러로 업데이트
                    newRole = ParticipantRole.HOST | ParticipantRole.BATTLER; // 5: 방장+배틀러
                } else {
                    newRole = ParticipantRole.PARTICIPANT | ParticipantRole.BATTLER; // 6: 참가자+배틀러
                }
                participant.updateRole(newRole);
            }
        }

        // 4. 배틀 상태를 진행중으로 변경
        battle.updateStatus(1);
        battleRepository.save(battle);


        // 5. 모든 참가자의 세션 정보 생성
        List<ParticipantSessionInfo> sessionInfos = new ArrayList<>();
        for (BattleParticipant participant : participants) {
            String connectionToken = openViduService.createConnection(battle.getSessionId());
            sessionInfos.add(new ParticipantSessionInfo(
                    participant.getUser().getId(),
                    participant.getRole(),
                    battle.getSessionId(),
                    connectionToken
            ));
        }

        return new BattleStartResponse(battleId, battle.getSessionId(), sessionInfos);

    }

}
