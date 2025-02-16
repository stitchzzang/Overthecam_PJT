package com.overthecam.battlereport.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.battlereport.dto.ReportRealTimeRequest;
import com.overthecam.battlereport.exception.BattleReportErrorCode;
import com.overthecam.battlereport.service.BattleReportService;
import com.overthecam.battlereport.service.FlaskService;
import com.overthecam.battlereport.service.OpenAiService;
import com.overthecam.battlereport.service.RedisService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.dto.ErrorResponse;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class BattleReportController {
    private final FlaskService flaskService;
    private final BattleReportService battleReportService;
    private final RedisService redisService;
    private final OpenAiService openAiService;
    private final ObjectMapper objectMapper;

    @PostMapping("/text")
    public CommonResponseDto<String> getText(@RequestBody Map<String, Object> request) {
        try {
            // 로그로 전체 요청 데이터 출력
            log.info("Received full request: {}", request);

            // text 추출
            String text = extractTextFromRequest(request);

            // userId는 hardcoding
            Integer userId = 1;

            log.info("Received text analysis request for userId: {} with text length: {}",
                    userId, text.length());

            // 플라스크 분석 결과를 받아서 직접 Redis에 저장
            String analysisResult = flaskService.analyzeText(userId, text);

            log.info("Analysis Result: {}", analysisResult);

            return CommonResponseDto.ok();
        } catch (Exception e) {
            log.error("Error processing text analysis request", e);
            return CommonResponseDto.ok();
        }
    }

    private String extractTextFromRequest(Map<String, Object> request) {
        // data 내부의 분석 결과 텍스트 재조합
        if (request == null || !request.containsKey("data")) {
            throw new IllegalArgumentException("잘못된 요청 형식입니다");
        }

        Map<String, Object> data = (Map<String, Object>) request.get("data");
        List<Map<String, Object>> analysisResults =
                (List<Map<String, Object>>) data.get("analysis_results");

        // 모든 분석 결과의 text를 합쳐서 하나의 문자열로 만듦
        return analysisResults.stream()
                .flatMap(result -> {
                    Map<String, Object> analysis = (Map<String, Object>) result.get("analysis");
                    List<Map<String, Object>> analysisDetails =
                            (List<Map<String, Object>>) analysis.get("analysis_results");

                    return analysisDetails.stream()
                            .map(detail -> (String) detail.get("text"));
                })
                .collect(Collectors.joining(" "));
    }

    @PostMapping("/generate/{userId}")
    public CommonResponseDto<Map<String, Object>> generateReport(@PathVariable Integer userId) {
        try {
            Map<String, Object> recentAnalysis = redisService.getRecentAnalysisResult(userId);

            if (recentAnalysis == null) {
                log.error("사용자 {}의 최근 분석 결과를 찾을 수 없습니다.", userId);
                return CommonResponseDto.error(ErrorResponse.of(BattleReportErrorCode.ANALYSIS_DATA_NOT_FOUND));
            }

            String analysisResultJson = objectMapper.writeValueAsString(recentAnalysis);
            Map<String, Object> report = openAiService.generateReport(analysisResultJson, userId);

            return CommonResponseDto.ok(report);

        } catch (Exception e) {
            log.error("리포트 생성 중 오류 발생. userId: {}", userId, e);
            return CommonResponseDto.error(ErrorResponse.of(BattleReportErrorCode.REPORT_GENERATION_FAILED));
        }
    }
}