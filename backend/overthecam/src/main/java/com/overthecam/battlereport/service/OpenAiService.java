package com.overthecam.battlereport.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class OpenAiService {
    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private String buildReportPrompt(List<Map<String, Object>> analysisResults, Integer userId) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("당신은 MZ세대를 위한 개인화된 토론 분석 리포트를 작성하는 분석가입니다. ");
        prompt.append("각 토론자의 고유한 스타일과 감정 패턴을 파악하여 맞춤형 리포트를 작성해주세요. ");
        prompt.append("모든 감정(기쁨, 슬픔, 분노, 불안, 중립)의 수치를 정확하게 계산하여 포함해주세요.\n\n");

        // 감정과 발화 데이터 수집
        Map<String, Double> totalEmotions = new HashMap<>();
        List<String> utterances = new ArrayList<>();
        final int[] sentenceCount = {0};

        for (Map<String, Object> result : analysisResults) {
            Map<String, Object> analysis = (Map<String, Object>) result.get("analysis");
            List<Map<String, Object>> analysisDetails =
                    (List<Map<String, Object>>) analysis.get("analysis_results");

            for (Map<String, Object> detail : analysisDetails) {
                utterances.add((String) detail.get("text"));
                Map<String, Object> scores = (Map<String, Object>) detail.get("scores");

                scores.forEach((emotion, score) -> {
                    totalEmotions.merge(emotion,
                            Double.parseDouble(score.toString()), Double::sum);
                });
                sentenceCount[0]++;
            }
        }

        // 평균 감정 점수 계산
        Map<String, String> emotionPercentages = new HashMap<>();
        totalEmotions.forEach((emotion, total) -> {
            double percentage = (total / sentenceCount[0]) * 100;
            emotionPercentages.put(emotion, String.format("%.4f%%", percentage));
        });

        prompt.append("분석할 토론 데이터:\n");
        prompt.append("발화 내용:\n");
        utterances.forEach(u -> prompt.append("- ").append(u).append("\n"));

        prompt.append("\n감정 분포 (평균):\n");
        emotionPercentages.forEach((emotion, percentage) ->
                prompt.append("- ").append(emotion).append(": ").append(percentage).append("\n"));

        // JSON 템플릿을 StringBuilder로 구성
        prompt.append("\n다음 JSON 형식으로 응답해주세요:\n");
        prompt.append("{\n");
        prompt.append("  \"report\": {\n");
        prompt.append("    \"userId\": ").append(userId).append(",\n");
        prompt.append("    \"title\": \"토론 분석 리포트 제목 (이모지 포함)\",\n");
        prompt.append("    \"summary\": \"개인화된 토론 내용 요약 (이모지와 친근한 MZ 말투 사용)\",\n");
        prompt.append("    \"emotion_analysis\": {\n");
        prompt.append("      \"기쁨\": \"정확한 비율%\",\n");
        prompt.append("      \"슬픔\": \"정확한 비율%\",\n");
        prompt.append("      \"분노\": \"정확한 비율%\",\n");
        prompt.append("      \"불안\": \"정확한 비율%\",\n");
        prompt.append("      \"중립\": \"정확한 비율%\"\n");
        prompt.append("    },\n");
        prompt.append("    \"key_arguments\": [\n");
        prompt.append("      \"주요 논점 1\",\n");
        prompt.append("      \"주요 논점 2\"\n");
        prompt.append("    ],\n");
        prompt.append("    \"debate_style\": \"개인화된 토론 스타일 분석 (이모지와 재미있는 표현 사용)\",\n");
        prompt.append("    \"suggestions\": \"맞춤형 개선 제안 (긍정적이고 응원하는 톤으로)\"\n");
        prompt.append("  }\n");
        prompt.append("}\n");

        prompt.append("\n반드시 위 JSON 형식을 지켜주시고, 모든 감정 수치를 정확하게 포함해주세요.");
        prompt.append("\n각 사용자의 토론 스타일과 감정 패턴을 반영한 개인화된 분석을 제공해주세요.");

        return prompt.toString();
    }

    public Map<String, Object> generateReport(String analysisResult, Integer userId) {
        try {
            log.info("분석 결과 길이: {}", analysisResult.length());
            log.info("분석 결과 미리보기: {}", analysisResult.substring(0, Math.min(500, analysisResult.length())));

            Map<String, Object> analysisMap = objectMapper.readValue(analysisResult, Map.class);
            Map<String, Object> data = (Map<String, Object>) analysisMap.get("data");
            List<Map<String, Object>> analysisResults =
                    (List<Map<String, Object>>) data.get("analysis_results");

            String prompt = buildReportPrompt(analysisResults, userId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("messages", Collections.singletonList(
                    Map.of("role", "user", "content", prompt)
            ));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);

            String reportJson = extractReportFromResponse(response.getBody());
            return objectMapper.readValue(reportJson, Map.class);

        } catch (Exception e) {
            log.error("리포트 생성 중 오류 발생", e);
            log.error("오류 상세: ", e);
            throw new RuntimeException("리포트 생성 실패", e);
        }
    }

    private String extractReportFromResponse(Map response) {
        try {
            log.info("OpenAI 응답: {}", response);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            } else {
                log.error("No choices found in OpenAI response");
                throw new RuntimeException("OpenAI 응답에 선택지가 없습니다");
            }
        } catch (Exception e) {
            log.error("OpenAI 응답에서 리포트 추출 중 오류 발생", e);
            throw new RuntimeException("리포트 추출 실패", e);
        }
    }
}