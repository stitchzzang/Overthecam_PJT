package com.overthecam.battle.service;

import com.overthecam.battle.dto.BattleCreateRequest;
import com.overthecam.battle.dto.BattleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BattleService {

    private final OpenViduService openViduService;

    public BattleResponse createBattleRoom(BattleCreateRequest request, String authToken) {

    }
}
