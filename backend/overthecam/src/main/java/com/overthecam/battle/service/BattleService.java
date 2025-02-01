package com.overthecam.battle.service;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.dto.BattleCreateRequest;
import com.overthecam.battle.dto.BattleResponse;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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


}
