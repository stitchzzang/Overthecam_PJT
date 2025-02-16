package com.overthecam.battlereport.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.battlereport.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
@Slf4j
public class DebugController {
    private final RedisService redisService;
    private final ObjectMapper objectMapper;

    @PostMapping("/test-redis-save")
    public ResponseEntity<?> testRedisSave(@RequestBody String analysisResult) {
        try {
            // 로그로 받은 원본 데이터 출력
            log.info("Received analysis result: {}", analysisResult);

            // 테스트용 고정 userId
            Integer userId = 1;

            // 받은 분석 결과를 Redis에 저장
            redisService.saveAnalysisResultToRedis(userId, analysisResult);

            // 저장 직후 데이터 검증
            Map<String, Object> savedData = redisService.getRecentAnalysisResult(userId);

            return ResponseEntity.ok(savedData);
        } catch (Exception e) {
            log.error("Redis 저장 중 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Redis 저장 중 오류: " + e.getMessage());
        }
    }
}