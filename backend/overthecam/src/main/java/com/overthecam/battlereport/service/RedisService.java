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
import java.util.*;

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
            log.info("===== Redis Save Operation Start =====");
            log.info("1. Received userId: {}", userId);

            // JSON 문자열을 Map으로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> analysisMap = objectMapper.readValue(analysisResult, Map.class);

            String redisKey = generateRedisKey(userId);
            log.info("2. Generated Redis Key: {}", redisKey);

            // Map 형태로 Redis에 저장
            try {
                redisTemplate.opsForValue().set(redisKey, analysisMap);
                log.info("3. Saved analysis map to Redis");

                // 저장 확인
                Object savedData = redisTemplate.opsForValue().get(redisKey);
                log.info("4. Verification - saved data: {}", savedData);
            } catch (Exception e) {
                log.error("Redis 저장 중 오류", e);
                throw new RuntimeException("Redis 저장 실패", e);
            }

            log.info("===== Redis Save Operation End =====");
        } catch (Exception e) {
            log.error("전체 프로세스 중 오류 발생", e);
            throw new RuntimeException("Redis 저장 프로세스 실패", e);
        }
    }

    // 분석 결과 추출 메서드
    private Map<String, Object> extractAnalysisResults(Map<String, Object> fullAnalysisMap) {
        Map<String, Object> extractedResult = new HashMap<>();
        try {
            if (fullAnalysisMap.containsKey("data")) {
                Map<String, Object> dataMap = (Map<String, Object>) fullAnalysisMap.get("data");

                // 전체 데이터 그대로 저장
                extractedResult.put("full_analysis", dataMap);

                // 추가 정보 추출
                if (dataMap.containsKey("batch_count")) {
                    extractedResult.put("batch_count", dataMap.get("batch_count"));
                }
                if (dataMap.containsKey("total_sentences")) {
                    extractedResult.put("total_sentences", dataMap.get("total_sentences"));
                }

                // 감정 매핑 데이터 추출
                if (dataMap.containsKey("analysis_results")) {
                    List<Map<String, Object>> analysisResults =
                            (List<Map<String, Object>>) dataMap.get("analysis_results");

                    // 각 분석 결과의 감정 스코어 추출
                    List<Map<String, Object>> emotionScores = new ArrayList<>();
                    for (Map<String, Object> analysis : analysisResults) {
                        Map<String, Object> analysisDetails = (Map<String, Object>) analysis.get("analysis");
                        List<Map<String, Object>> analysisResults2 =
                                (List<Map<String, Object>>) analysisDetails.get("analysis_results");

                        for (Map<String, Object> result : analysisResults2) {
                            Map<String, Object> emotionData = new HashMap<>();
                            emotionData.put("text", result.get("text"));
                            emotionData.put("emotion", result.get("emotion"));
                            emotionData.put("scores", result.get("scores"));
                            emotionScores.add(emotionData);
                        }
                    }

                    extractedResult.put("emotion_analysis", emotionScores);
                }
            }

            log.info("Extracted result structure: {}", extractedResult);
            return extractedResult;
        } catch (Exception e) {
            log.error("Error extracting analysis results", e);
            return extractedResult;
        }
    }

    /**
     * Redis 키 생성
     *
     * @param userId 사용자 ID
     * @return 생성된 Redis 키
     */
    private String generateRedisKey(Integer userId) {
        return String.format("debate:analysis:%d:%s",
                userId, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm")));
//        String key = String.format(
//                "debate:analysis:%d:%s",
//                userId,
//                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
//        );
//        log.info("Generated key: {}", key);
//        return key;
    }

    /**
     * Flask 분석 결과 JSON 파싱
     *
     * @param analysisResult Flask 분석 결과 JSON 문자열
     * @return 파싱된 분석 결과 맵
     */
    private Map<String, Object> parseAnalysisResult(String analysisResult) throws JsonProcessingException {
        try {
            // TypeReference를 사용해 복잡한 중첩 구조 파싱
            return objectMapper.readValue(
                    analysisResult,
                    new TypeReference<Map<String, Object>>() {}
            );
        } catch (JsonProcessingException e) {
            log.error("JSON 파싱 중 오류 발생", e);
            log.error("문제가 있는 JSON: {}", analysisResult);
            throw e;
        }
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
                log.warn("사용자 {}의 분석 결과 키를 찾을 수 없습니다.", userId);
                return null;
            }

            // 가장 최근 키 선택 (문자열 기준 정렬 후 마지막 항목)
            String latestKey = keys.stream()
                    .sorted(Comparator.reverseOrder())
                    .findFirst()
                    .orElse(null);

            if (latestKey == null) {
                log.warn("최근 키를 선택할 수 없습니다.");
                return null;
            }

            Object storedData = redisTemplate.opsForValue().get(latestKey);

            if (storedData == null) {
                log.warn("키 {}에 저장된 데이터가 없습니다.", latestKey);
                return null;
            }

            // Map 형태로 반환
            return (Map<String, Object>) storedData;

        } catch (Exception e) {
            log.error("Redis에서 최근 분석 결과 조회 중 오류 발생", e);
            return null;
        }
    }

    public void checkRedisData(Integer userId) {
        String redisKey = generateRedisKey(userId);
        Object storedData = redisTemplate.opsForValue().get(redisKey);

        if (storedData != null) {
            log.info("Redis에 저장된 데이터: {}", storedData);
        } else {
            log.warn("Redis에 데이터가 없음: {}", redisKey);
        }
    }

    // 연결 테스트 메서드 추가
    public void testConnection() {
        try {
            String pong = redisTemplate.getConnectionFactory().getConnection().ping();
            log.info("Redis connection successful. Ping response: {}", pong);
        } catch (Exception e) {
            log.error("Redis connection failed", e);
            // 구체적인 예외 로깅
            log.error("Connection error details: ", e);
        }
    }
}