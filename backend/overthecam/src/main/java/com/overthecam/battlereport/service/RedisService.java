package com.overthecam.battlereport.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Flask 분석 결과를 Redis에 저장
     *
     * @param userId         사용자 ID
     * @param analysisResult Flask 분석 결과
     */
    public void saveAnalysisResultToRedis(Integer userId, String analysisResult) {
        try {
            log.info("Starting to save analysis result for userId: {}", userId);
            log.info("Received analysis result: {}", analysisResult);

            // Redis 키 생성 (예: debate:analysis:userId:timestamp)
            String redisKey = generateRedisKey(userId);
            //키는 생성완료

            // JSON 문자열을 Map으로 변환
            Map<String, Object> analysisMap = parseAnalysisResult(analysisResult);

            // Redis에 저장
            redisTemplate.opsForValue().set(
                    redisKey,
                    analysisMap,
                    Duration.ofDays(7)  // 7일 동안 보관
            );

            log.info("Analysis result saved to Redis: {}", redisKey);
        } catch (Exception e) {
            log.error("Error saving analysis result to Redis", e);
        }
    }

    /**
     * Redis 키 생성
     *
     * @param userId 사용자 ID
     * @return 생성된 Redis 키
     */
    private String generateRedisKey(Integer userId) {
        return String.format(
                "debate:analysis:%d:%s",
                userId,
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }

    /**
     * Flask 분석 결과 JSON 파싱
     *
     * @param analysisResult Flask 분석 결과 JSON 문자열
     * @return 파싱된 분석 결과 맵
     */
    private Map<String, Object> parseAnalysisResult(String analysisResult) throws JsonProcessingException {
        return objectMapper.readValue(
                analysisResult,
                new TypeReference<Map<String, Object>>() {
                }
        );
    }

    /**
     * Redis에서 특정 사용자의 최근 분석 결과 조회
     *
     * @param userId 사용자 ID
     * @return 분석 결과 맵
     */
    public Map<String, Object> getRecentAnalysisResult(Integer userId) {
        try {
            // 패턴 매칭으로 가장 최근 키 찾기
            Set<String> keys = redisTemplate.keys("debate:analysis:" + userId + ":*");

            if (keys == null || keys.isEmpty()) {
                return null;
            }

            // 가장 최근 키 선택 (문자열 기준 정렬 후 마지막 항목)
            String latestKey = keys.stream()
                    .sorted(Comparator.reverseOrder())
                    .findFirst()
                    .orElse(null);

            return (Map<String, Object>) redisTemplate.opsForValue().get(latestKey);
        } catch (Exception e) {
            log.error("Error retrieving analysis result from Redis", e);
            return null;
        }
    }
}