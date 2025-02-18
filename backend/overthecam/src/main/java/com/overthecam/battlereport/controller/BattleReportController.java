package com.overthecam.battlereport.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.battlereport.domain.BattleReport;
import com.overthecam.battlereport.dto.ReportRealTimeRequest;
import com.overthecam.battlereport.exception.BattleReportErrorCode;
import com.overthecam.battlereport.repository.BattleReportRepository;
import com.overthecam.battlereport.service.BattleReportService;
import com.overthecam.battlereport.service.FlaskService;
import com.overthecam.battlereport.service.OpenAiService;
import com.overthecam.battlereport.service.RedisService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.dto.ErrorResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class BattleReportController {
    private final FlaskService flaskService;
    private final RedisService redisService;
    private final OpenAiService openAiService;
    private final ObjectMapper objectMapper;
    private final BattleReportService battleReportService;



    @PostMapping("/text")
    public CommonResponseDto<?> getText(@RequestBody ReportRealTimeRequest request) {
        try {

            log.info("시작점");

            //flask에 보냄
            String analysisResult = flaskService.analyzeText(request.getUserId(), request.getText());

            log.info("Analysis Result: {}", analysisResult);

            return CommonResponseDto.ok(analysisResult);
        } catch (IllegalArgumentException e) {
            log.error("잘못된 요청 형식", e);
            return CommonResponseDto.error(ErrorResponse.of(BattleReportErrorCode.ANALYSIS_DATA_NOT_FOUND));
        } catch (Exception e) {
            log.error("분석 중 오류 발생", e);
            return CommonResponseDto.error(ErrorResponse.of(BattleReportErrorCode.REPORT_GENERATION_FAILED));
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
            String analysisResultJson = objectMapper.writeValueAsString(recentAnalysis);
            Map<String, Object> report = openAiService.generateReport(analysisResultJson, userId);


            // 서비스를 통한 저장
            Map<String, Object> reportContent = (Map<String, Object>) report.get("report");
            battleReportService.generateAndSaveBattleReport(userId);

            return CommonResponseDto.ok(report);
        } catch (Exception e) {
            log.error("리포트 생성 중 오류 발생. userId: {}", userId, e);
            return CommonResponseDto.error(ErrorResponse.of(BattleReportErrorCode.REPORT_GENERATION_FAILED));
        }
    }
}