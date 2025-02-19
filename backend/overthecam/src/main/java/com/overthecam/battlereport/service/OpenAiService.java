package com.overthecam.battlereport.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class OpenAiService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    @Value("${openai.api.key}")
    private String apiKey;
    @Value("${openai.api.url}")
    private String apiUrl;

    private String buildReportPrompt(List<Map<String, Object>> analysisResults, Integer userId) {

        StringBuilder prompt = new StringBuilder();
        prompt.append("당신은 밸런스게임부터 진지한 토론까지 다양한 논쟁을 판정해주기 위한 개인화된 토론 분석 리포트를 작성하는 분석가입니다. ");
        prompt.append("각 토론자의 고유한 스타일과 감정 패턴을 파악하여 맞춤형 리포트를 작성해주세요. ");
        prompt.append("모든 감정(기쁨, 슬픔, 분노, 불안, 중립)의 수치를 정확하게 계산하여 포함해주세요.\n\n");

        // 감정과 발화 데이터 수집
        Map<String, Double> totalEmotions = new HashMap<>();
        List<String> utterances = new ArrayList<>();
        final int[] sentenceCount = {0};


        // 직접 analysisResults 처리
        for (Map<String, Object> detail : analysisResults) {
            String text = (String) detail.get("text");
            if (text != null) {
                utterances.add(text);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> scores = (Map<String, Object>) detail.get("scores");
            if (scores != null) {
                scores.forEach((emotion, score) -> {
                    // @class 키는 건너뛰기
                    if (!"@class".equals(emotion) && score instanceof Number) {
                        totalEmotions.merge(emotion,
                                ((Number) score).doubleValue(),
                                Double::sum);
                    }
                });
                sentenceCount[0]++;
            }
        }

//        for (Map<String, Object> result : analysisResults) {
//            Map<String, Object> analysis = (Map<String, Object>) result.get("analysis");
//            List<Map<String, Object>> analysisDetails =
//                    (List<Map<String, Object>>) analysis.get("analysis_results");
//
//            for (Map<String, Object> detail : analysisDetails) {
//                utterances.add((String) detail.get("text"));
//                Map<String, Object> scores = (Map<String, Object>) detail.get("scores");
//
//                scores.forEach((emotion, score) -> {
//                    totalEmotions.merge(emotion,
//                            Double.parseDouble(score.toString()), Double::sum);
//                });
//                sentenceCount[0]++;
//            }
//        }


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

        prompt.append("\n다음 JSON 형식으로 응답해 주시기 바랍니다:\n");
        prompt.append("{\n");
        prompt.append("  \"report\": {\n");
        prompt.append("    \"userId\": ").append(userId).append(",\n");
        prompt.append("    \"title\": \"토론의 주된 논쟁 내용을 반영한 분석 리포트 제목 (이모지를 포함하는데 위치 맨 앞에 넣어줘). " +
                "그리고 아래에 주장이라고 쓰여져 있는 곳에는 vert에서 가져온 토론 summary 를 참고해줘. 예시:\n");
        prompt.append("      - '🔥 주장 1 vs 주장 2'\n");
        prompt.append("      - '💡 주장 1이 더 나은가 주장 2가 더 나은가'\n");
        prompt.append("      주제와 주요 발언을 반영하여 제목을 다양하게 생성해 주세요.\"\n");
        prompt.append("    \"summary\": \"개인화된 토론 내용 요약 (이모지와 정중한 말투를 사용해 주세요)\",\n");
        prompt.append("    \"emotion_analysis\": {\n");
        prompt.append("      \"기쁨\": \"정확한 비율%\",\n");
        prompt.append("      \"슬픔\": \"정확한 비율%\",\n");
        prompt.append("      \"분노\": \"정확한 비율%\",\n");
        prompt.append("      \"불안\": \"정확한 비율%\",\n");
        prompt.append("      \"중립\": \"정확한 비율%\"\n");
        prompt.append("    },\n");
        prompt.append("    \"key_arguments\": [\n");
        prompt.append("      \"주요 논점을 작성해 주세요\"\n");
        prompt.append("    ],\n");
        prompt.append("    \"debate_analysis\": {\n");
        prompt.append("      \"선택한 답변\": \"토론자께서 선택하신 옵션\",\n");
        prompt.append("      \"주요 발언\": [\n");
        prompt.append("        \"토론자께서 하신 주요 발언 1\",\n");
        prompt.append("        \"토론자께서 하신 주요 발언 2\"\n");
        prompt.append("      ],\n");
        prompt.append("      \"논리적 설득력 점수\": \"1~10 점수로 평가해 주세요\",\n");
        prompt.append("      \"감정적 반응 분석\": \"격렬하셨는지, 유머러스하셨는지, 차분하셨는지 등을 분석해 주세요\",\n");
        prompt.append("      \"토론에서의 역할\": \"중재자, 도전자, 감정적 반응을 보이신 분 등으로 분석해 주세요\",\n");
        prompt.append("      \"논쟁 발생 시 반응\": \"상대방과의 의견 차이를 어떻게 다루셨는지 분석해 주세요\"\n");
        prompt.append("    },\n");
        prompt.append("    \"ai_evaluation\": {\n");
        prompt.append("      \"종합 평가\": \"토론자의 스타일을 한 문장으로 정중하게 요약해 주시기 바랍니다. 예시:\n");
        prompt.append("      - '깊은 통찰력을 지니시고, 타인의 감정을 잘 공감하시는 분석가이십니다'\n");
        prompt.append("      - '논리로 상대를 설득하시는 냉철한 토론가이십니다'\n");
        prompt.append("      - '자신의 신념을 끝까지 지키시는 열정적인 토론가이십니다'\n");
        prompt.append("      - '모든 의견을 존중하시는 배려심 깊은 중재자이십니다'\n");
        prompt.append("      토론자의 감정 반응과 토론 태도를 반영하여 정중하게 평가해 주시기 바랍니다.\"\n");
        prompt.append("    }\n");
        prompt.append("  }\n");
        prompt.append("}\n");

        prompt.append("\n반드시 위 JSON 형식을 지켜주시고, 모든 감정 수치를 정확하게 포함해 주시기 바랍니다.");
        prompt.append("\n각 토론자의 스타일과 감정 패턴을 반영한 개인화된 분석을 정중하게 제공해 주시기 바랍니다.");

        return prompt.toString();
    }

    public Map<String, Object> generateReport(String analysisResult, Integer userId) {
        try {
            log.info("분석 결과 길이: {}", analysisResult.length());
            log.info("분석 결과 미리보기: {}", analysisResult.substring(0, Math.min(500, analysisResult.length())));

            Map<String, Object> analysisMap = objectMapper.readValue(analysisResult, Map.class);
            Map<String, Object> data = (Map<String, Object>) analysisMap.get("data");

            if (data == null) {
                throw new IllegalArgumentException("데이터가 null입니다");
            }

            List<Map<String, Object>> analysisResults = (List<Map<String, Object>>) data.get("analysis_results");


            // 1. 입력값 검증
            if (analysisResult == null || analysisResult.isEmpty()) {
                log.error("분석 결과가 비어있습니다");
                throw new IllegalArgumentException("분석 결과가 비어있습니다");
            }


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