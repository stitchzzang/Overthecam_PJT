package com.overthecam.battle.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.overthecam.battle.domain.Battle;
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

    //OpenVidu와 HTTP 통신할 때 사용
    private final RestTemplate restTemplate;

    private final BattleRepository battleRepository;

    @Value("${openvidu.url}")
    private String OPENVIDU_URL;
    @Value("${openvidu.secret}")
    private String SECRET;

    //인증된 사용자로 부터 얻은 userId
    public String createBattleSession(Long userId) {


        //Openvidu에게 요청을 보내기 위해 header와 body를 생성한다.
        // HTTP 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        // Basic 인증 헤더 추가
        headers.add("Authorization", getBasicAuth());
        // Content-Type을 JSON으로 설정
        headers.setContentType(MediaType.APPLICATION_JSON); //header end

        // HTTP 요청 객체 생성 (빈 바디와 헤더)
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(new HashMap<>(), headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(
                OPENVIDU_URL + "/openvidu/api/sessions",
                HttpMethod.POST,
                request,
                JsonNode.class
        ); //body end

        // Openvidu로 받은 응답에서 세션 ID 추출
        String sessionId = response.getBody().get("id").asText();

        Battle battle = Battle.builder()
                .sessionId(sessionId)
                .build();
        battleRepository.save(battle);

        return sessionId;

    }

    // Openvidu를 위한  Basic 인증 헤더 생성
    private String getBasicAuth() {
        return "Basic " + Base64.getEncoder().encodeToString(("OPENVIDUAPP:" + SECRET).getBytes());
    }

}
