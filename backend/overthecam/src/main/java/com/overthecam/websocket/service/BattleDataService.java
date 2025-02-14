package com.overthecam.websocket.service;

import com.overthecam.battle.service.BattleService;
import com.overthecam.websocket.dto.BattleData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleDataService {

    private final BattleService battleService;
    private final BattleStartService battleStartService;
    private final BattleVoteService voteService;

    @Transactional
    public BattleData handleBattleStart(Long battleId) {

        if (!battleService.canStartBattle(battleId)) {
            throw new RuntimeException("모든 참가자가 준비되지 않았습니다.");
        }

        return BattleData.builder()
                .battleId(battleId)
                .voteInfo(voteService.getVoteInfo(battleId))
                .participants(battleStartService.getParticipants(battleId))
                .build();
    }
}
