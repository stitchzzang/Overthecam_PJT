package com.overthecam.battle.service;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.dto.BattleCreateRequest;
import com.overthecam.battle.dto.BattleResponse;
import com.overthecam.battle.repository.BattleRepository;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BattleService {

    private final OpenViduService openViduService;
    private final BattleRepository battleRepository;

    public BattleResponse createBattleRoom(BattleCreateRequest request, String authToken) throws OpenViduJavaClientException, OpenViduHttpException {

        // 1. 사용자 인증 확인
        // User user = userService.validateUser(authToken);

        // 2. OpenVidu 세션 생성
        Session session = openViduService.createSession();
        String sessionId = session.getSessionId();

        // 3. Battle 엔티티 생성 및 저장
        Battle battle = Battle.builder()
                .title(request.getTitle())
                .sessionId(sessionId)
                .status(0)  // WAITING 상태
                .roomUrl(generateRoomUrl())
                .thumbnailUrl("https://d26tym50939cjl.cloudfront.net/frame1.png")
                .totalUsers(1)  // 방장 포함
                .timestamp(LocalDateTime.now())
                .build();

        Battle savedBattle = battleRepository.save(battle);

        // 4. BattleParticipant 엔티티 생성 및 저장 (방장)
        BattleParticipant host = BattleParticipant.builder()
                .battle(savedBattle)
                //.user(user)
                .role(1)  // HOST 역할
                .timestamp(LocalDateTime.now())
                .build();

    }
}
