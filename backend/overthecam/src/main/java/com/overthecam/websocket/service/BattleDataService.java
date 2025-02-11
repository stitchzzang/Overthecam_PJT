package com.overthecam.websocket.service;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.Status;
import com.overthecam.websocket.dto.BattleData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleDataService {

    private final BattleWebsocketService battleService;
    private final BattleVoteService voteService;

    @Transactional
    public BattleData handleBattleStart(Long battleId) {
        Battle battle = battleService.updateBattleStatus(battleId, Status.PROGRESS);

        return BattleData.builder()
                .battleId(battleId)
                .voteInfo(voteService.getVoteInfo(battleId))
                .participants(battleService.getParticipants(battleId))
                .build();
    }
}
