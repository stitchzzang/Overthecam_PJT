package com.overthecam.battlereport.service;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class BattleReportService {
    private final RedisService redisService;
    private final OpenAiService openAiService;

    @Transactional
    public Map<String, Object> generateBattleReport(Integer userId) {
        try {
            // 1. Redis에서 해당 유저의 모든 감정 분석 데이터 조회
            Map<String, Object> analysisData = redisService.getRecentAnalysisResult(userId);

            if (analysisData == null) {
                log.warn("사용자 {}에 대한 분석 데이터를 찾을 수 없습니다.", userId);
                throw new EntityNotFoundException("사용자 " + userId + "에 대한 분석 데이터가 없습니다.");
            }

            // 2. 감정 분석 데이터 포맷팅
            String formattedData = formatAnalysisData(analysisData, userId);

            // OpenAI로 리포트 생성
            return openAiService.generateReport(formattedData, userId);

        } catch (EntityNotFoundException e) {
            log.error("분석 데이터 없음: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("배틀 리포트 생성 중 오류 발생", e);
            throw new RuntimeException("배틀 리포트 생성 실패", e);
        }
    }

    private String formatAnalysisData(Map<String, Object> analysisData, Integer userId) {
        try {
            StringBuilder formattedData = new StringBuilder();

            // 타입 안전성 추가
            // 감정 분석 데이터 포맷팅 로직
            List<Map<String, Object>> analysisResults =
                    (List<Map<String, Object>>) analysisData.getOrDefault("analysis_results", Collections.emptyList());

            // 발화 텍스트와 감정 데이터 추출
            for (Map<String, Object> result : analysisResults) {
                String text = Optional.ofNullable(result.get("text"))
                        .map(Object::toString)
                        .orElse("Unknown Text");

                Map<String, Object> emotions =
                        (Map<String, Object>) result.getOrDefault("emotions", Collections.emptyMap());

                formattedData.append("Text: ").append(text).append("\n");
                formattedData.append("Emotions: ").append(emotions).append("\n\n");
            }

            return formattedData.toString();

        } catch (Exception e) {
            log.error("데이터 포맷팅 중 오류 발생", e);
            throw new RuntimeException("분석 데이터 포맷팅 실패", e);
        }
    }
}