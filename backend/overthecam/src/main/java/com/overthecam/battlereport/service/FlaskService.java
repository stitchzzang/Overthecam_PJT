package com.overthecam.battlereport.service;


import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@AllArgsConstructor
public class FlaskService {

    private final RestTemplate restTemplate;
    private final RedisService redisService;

    public String analyzeText(Integer userId, String text) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("speakerId", userId);
            requestBody.put("text", text);

            log.info("플라스크 시작 전");

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://overthecam.site:15555/python/api/debate/analyze",
                    requestBody,
                    String.class
            );

            String analysisResult = Optional.ofNullable(response.getBody())
                    .orElseThrow(() -> new RuntimeException("분석 결과가 없습니다."));

            validateAnalysisResult(analysisResult);
            //redis 저장 로직
            redisService.saveAnalysisResultToRedis(userId, analysisResult);

            return analysisResult;
        } catch (RestClientException e) {
            log.error("Flask 서버 통신 오류", e);
            throw new RuntimeException("Flask 서버 통신 실패", e);
        }
    }

    private void validateAnalysisResult(String analysisResult) {
        if (analysisResult == null || analysisResult.trim().isEmpty()) {
            throw new IllegalArgumentException("분석 결과가 비어있습니다.");
        }
    }
}