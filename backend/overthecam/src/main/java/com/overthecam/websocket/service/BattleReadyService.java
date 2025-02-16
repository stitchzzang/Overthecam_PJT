package com.overthecam.websocket.service;

import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.redis.repository.BattleReadyRedisRepository;
import com.overthecam.websocket.dto.BattleReadyStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleReadyService {

    private final BattleParticipantRepository battleParticipantRepository;
    private final BattleReadyRedisRepository battleReadyRedisRepository;

    @Transactional
    public BattleReadyStatus toggleReady(Long battleId, Long userId, String nickname) {
        boolean currentReady = battleReadyRedisRepository.isUserReady(battleId, userId);

        if (currentReady) {
            battleReadyRedisRepository.markUserReady(battleId, userId);
        } else {
            battleReadyRedisRepository.cancelUserReady(battleId, userId);
        }

        return BattleReadyStatus.builder()
            .userId(userId)
            .nickname(nickname)
            .ready(currentReady)
            .build();
    }


    @Transactional
    public boolean canStartBattle(Long battleId) {
        int totalParticipants = (int) battleParticipantRepository.countByBattleId(battleId);
        boolean allReady = battleReadyRedisRepository.areAllParticipantsReady(battleId, totalParticipants);

        log.info("배틀 시작 가능 여부 | battleId: {}, allReady: {}", battleId, allReady);

        if (allReady) {
            battleReadyRedisRepository.clearReadyStatus(battleId);
        }

        return allReady;
    }
}
