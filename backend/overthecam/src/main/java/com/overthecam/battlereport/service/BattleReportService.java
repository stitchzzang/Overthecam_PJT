package com.overthecam.battlereport.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.battlereport.domain.BattleReport;
import com.overthecam.battlereport.repository.BattleReportRepository;
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
    private final BattleReportRepository battleReportRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public BattleReport generateAndSaveBattleReport(Integer userId) {
        try {
            Map<String, Object> analysisData = redisService.getRecentAnalysisResult(userId);

            if (analysisData == null) {
                log.warn("사용자 {}에 대한 분석 데이터를 찾을 수 없습니다.", userId);
                throw new EntityNotFoundException("사용자 " + userId + "에 대한 분석 데이터가 없습니다.");
            }

            // analysisData를 JSON 문자열로 변환
            String analysisResultJson = objectMapper.writeValueAsString(analysisData);

            // OpenAI로 리포트 생성
            Map<String, Object> reportData = openAiService.generateReport(analysisResultJson, userId);
            Map<String, Object> reportContent = (Map<String, Object>) reportData.get("report");

            // BattleReport 엔티티 생성 및 저장
            BattleReport battleReport = BattleReport.builder()
                    .userId(userId)
                    .title((String) reportContent.get("title"))
                    .summary((String) reportContent.get("summary"))
                    .emotionAnalysis(objectMapper.writeValueAsString(reportContent.get("emotion_analysis")))
                    .keyArguments(objectMapper.writeValueAsString(reportContent.get("key_arguments")))
                    .debateAnalysis(objectMapper.writeValueAsString(reportContent.get("debate_analysis")))
                    .aiEvaluation(objectMapper.writeValueAsString(reportContent.get("ai_evaluation")))
                    .build();

            return battleReportRepository.save(battleReport);

        } catch (Exception e) {
            log.error("리포트 생성 중 오류 발생", e);
            throw new RuntimeException("리포트 생성 실패", e);
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

    // 사용자의 모든 배틀 리포트 조회
    public List<BattleReport> getUserBattleReports(Integer userId) {
        return battleReportRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 특정 배틀 리포트 조회
    public BattleReport getBattleReport(Long reportId) {
        return battleReportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("배틀 리포트를 찾을 수 없습니다: " + reportId));
    }
}