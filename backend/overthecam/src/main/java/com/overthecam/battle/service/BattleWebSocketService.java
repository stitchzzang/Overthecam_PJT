package com.overthecam.battle.service;

import com.overthecam.auth.dto.UserScoreDto;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.dto.BattleData;
import com.overthecam.battle.dto.BattleDataType;
import com.overthecam.battle.dto.BattleWebSocketMessage;
import com.overthecam.battle.dto.ParticipantInfo;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.websocket.dto.WebSocketResponseDto;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleWebSocketService {

    private final UserRepository userRepository;
    private final BattleRepository battleRepository;
    private final BattleParticipantRepository battleParticipantRepository;

    public WebSocketResponseDto<?> handleBattleStart(BattleWebSocketMessage<?> message, Long battleId) {
        Battle battle = battleRepository.findById(battleId)
            .orElseThrow(() -> new RuntimeException("Battle not found"));

        List<BattleParticipant> participants = battleParticipantRepository.findAllByBattleIdWithUser(battleId);

        // 1. 배틀 시작을 위한 초기 데이터 정보 생성
        BattleData battleStartInfo = BattleData.builder()
            .battleId(battleId)
            .sessionId(battle.getSessionId())
            .participants(participants.stream()
                .map(p -> new ParticipantInfo(
                    p.getUser().getUserId(),
                    p.getUser().getNickname(),
                    p.getUser().getProfileImage(),
                    p.getRole(),
                    p.getConnectionToken(),
                    p.getUser().getSupportScore(),
                    p.getUser().getPoint()
                ))
                .collect(Collectors.toList()))
            .build();

        // 2. 배틀 상태를 진행중으로 변경
        battle.updateStatus(Status.PROGRESS);
        battleRepository.save(battle);
        log.info("배틀 상태 업데이트 완료 - battleId: {}, 변경된 status: {}", battle.getId(), battle.getStatus());


        return WebSocketResponseDto.success(
            BattleWebSocketMessage.builder()
                .type(BattleDataType.BATTLE_START)
                .battleId(battleId)
                .data(battleStartInfo)
                .build()
        );
    }


    // redis로 상태 관리 후, 배틀이 종료되면 DB에 업데이트 로직 필요
    public WebSocketResponseDto<?> handleCheerUpdate(BattleWebSocketMessage<UserScoreDto> message, Long userId) {
        log.debug("Handling cheer score update for battle: {}", message.getBattleId());

        Integer score = message.getData().getSupportScore();

        // 응원점수 업데이트 로직
        BattleData data = BattleData.updateSupportScore(score);
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
    public WebSocketResponseDto<?> handlePointUpdate(BattleWebSocketMessage<UserScoreDto> message, Long userId) {
        log.debug("Handling point update for battle: {}", message.getBattleId());

        Integer point = message.getData().getPoint();

        // 포인트 업데이트 로직
        BattleData data = BattleData.updatePoints(point);
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
