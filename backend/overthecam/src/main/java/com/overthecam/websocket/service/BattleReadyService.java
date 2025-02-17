package com.overthecam.websocket.service;

import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.redis.repository.BattleReadyRedisRepository;
import com.overthecam.websocket.dto.BattleReadyUser;
import jakarta.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
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
    public BattleReadyUser toggleReady(Long battleId, boolean ready, Long userId, String nickname) {

        if (ready) {
            battleReadyRedisRepository.markUserReady(battleId, userId, nickname);
        } else {
            battleReadyRedisRepository.cancelUserReady(battleId, userId);
        }

        return BattleReadyUser.builder()
            .userId(userId)
            .nickname(nickname)
            .ready(ready)
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

    public List<BattleReadyUser> getReadyUsers(Long battleId) {
        Set<String> readyUserData = battleReadyRedisRepository.getReadyUsers(battleId);

        if (readyUserData.isEmpty()) {
            return Collections.emptyList();
        }

        return readyUserData.stream()
            .map(data -> {
                String[] parts = data.split(":");
                return BattleReadyUser.builder()
                    .userId(Long.parseLong(parts[0]))
                    .nickname(parts[1])
                    .ready(true)
                    .build();
            })
            .collect(Collectors.toList());
    }
}
