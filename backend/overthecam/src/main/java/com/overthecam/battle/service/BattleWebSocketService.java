package com.overthecam.battle.service;

import com.overthecam.auth.dto.UserScoreDto;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.dto.BattleData;
import com.overthecam.battle.dto.BattleDataType;
import com.overthecam.battle.dto.BattleWebSocketMessage;
import com.overthecam.websocket.dto.WebSocketResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleWebSocketService {

    private final UserRepository userRepository;

    public WebSocketResponseDto<?> handleInitialData(BattleWebSocketMessage message, Long userId) {
        log.debug("Handling initial data request for battle: {}", message.getBattleId());

        UserScoreDto userScoreDto = userRepository.findScoreAndPointByUserId(userId).get();

        BattleData data = BattleData.builder()
            .cheerScore(userScoreDto.getSupportScore())
            .points(userScoreDto.getPoint())
            .build();

        return WebSocketResponseDto.success(
            BattleWebSocketMessage.builder()
                .type(BattleDataType.INITIAL_DATA)
                .battleId(message.getBattleId())
                .userId(message.getUserId())
                .data(data)
                .build()
        );
    }

    // redis로 상태 관리 후, 배틀이 종료되면 DB에 업데이트 로직 필요
    public WebSocketResponseDto<?> handleCheerUpdate(BattleWebSocketMessage message, Long userId) {
        log.debug("Handling cheer score update for battle: {}", message.getBattleId());

        Integer score = message.getData().getCheerScore();

        // 응원점수 업데이트 로직
        BattleData data = BattleData.cheerScoreOnly(score);
        userRepository.updateSupportScore(userId, score);

        return WebSocketResponseDto.success(
            BattleWebSocketMessage.builder()
                .type(BattleDataType.CHEER_UPDATE)
                .battleId(message.getBattleId())
                .userId(message.getUserId())
                .data(data)
                .build()
        );
    }

    // redis로 상태 관리 후, 배틀이 종료되면 DB에 업데이트 로직 필요
    public WebSocketResponseDto<?> handlePointUpdate(BattleWebSocketMessage message, Long userId) {
        log.debug("Handling point update for battle: {}", message.getBattleId());

        Integer point = message.getData().getPoints();

        // 포인트 업데이트 로직
        BattleData data = BattleData.pointsOnly(point);
        userRepository.updatePoint(userId, point);

        return WebSocketResponseDto.success(
            BattleWebSocketMessage.builder()
                .type(BattleDataType.POINT_UPDATE)
                .battleId(message.getBattleId())
                .userId(message.getUserId())
                .data(data)
                .build()
        );
    }
}
