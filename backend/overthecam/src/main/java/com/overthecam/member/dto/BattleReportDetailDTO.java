package com.overthecam.member.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.battlereport.domain.BattleReport;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class BattleReportDetailDTO {
    private Long id;
    private String title;
    private String summary;
    private Map<String, String> emotionAnalysis;
    private List<String> keyArguments;
    private Map<String, Object> debateAnalysis;
    private Map<String, String> aiEvaluation;
    private LocalDateTime createdAt;

    public static BattleReportDetailDTO from(BattleReport report) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            return BattleReportDetailDTO.builder()
                    .id(report.getId())
                    .title(report.getTitle())
                    .summary(report.getSummary())
                    .emotionAnalysis(objectMapper.readValue(report.getEmotionAnalysis(), Map.class))
                    .keyArguments(objectMapper.readValue(report.getKeyArguments(), List.class))
                    .debateAnalysis(objectMapper.readValue(report.getDebateAnalysis(), Map.class))
                    .aiEvaluation(objectMapper.readValue(report.getAiEvaluation(), Map.class))
                    .createdAt(report.getCreatedAt())
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 중 오류 발생", e);
        }
    }
}