package com.overthecam.battle.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.dto.BattleCreateRequest;
import com.overthecam.battle.dto.BattleResponse;
import com.overthecam.battle.repository.BattleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BattleService {

    private final OpenviduSer

    public BattleResponse createBattleRoom(BattleCreateRequest request, String authToken) {

    }
}
