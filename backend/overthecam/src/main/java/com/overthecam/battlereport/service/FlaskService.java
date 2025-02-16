package com.overthecam.battlereport.service;

import com.overthecam.battlereport.dto.TextAnalysisRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@AllArgsConstructor
public class FlaskService {

    private final RestTemplate restTemplate;
    private final RedisService redisService;

    public String analyzeText(Integer userId, String text) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("userId", userId);
            requestBody.put("text", text);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "http://localhost:5001/api/debate/analyze",
                    requestBody,
                    String.class
            );

            String analysisResult = response.getBody();

            // 분석 결과를 Redis에 저장
            redisService.saveAnalysisResultToRedis(userId, analysisResult);

            return analysisResult;
        } catch (Exception e) {
            log.error("텍스트 분석 중 오류 발생", e);
            throw new RuntimeException("텍스트 분석 실패", e);
        }
    }
}