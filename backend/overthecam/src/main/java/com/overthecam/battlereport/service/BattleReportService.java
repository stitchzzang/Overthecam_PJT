//package com.overthecam.battlereport.service;
//
//
//import com.overthecam.battle.domain.Battle;
//import com.overthecam.battle.repository.BattleRepository;
//import com.overthecam.battlereport.domain.BattleReport;
//import com.overthecam.battlereport.repository.BattleRecordRepository;
//import com.overthecam.battlereport.repository.BattleReportRepository;
//import jakarta.persistence.EntityNotFoundException;
//import jakarta.transaction.Transactional;
//import lombok.RequiredArgsConstructor;
//import lombok.Value;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.net.http.WebSocket;
//
//@Service
//@Slf4j
//@RequiredArgsConstructor
//public class BattleReportService {
//    private final BattleRepository battleRepository;
//    private final WebSocket webSocket;
//
//    // Python 모델 서버와 통신하기 위한 RestTemplate
//    private final RestTemplate restTemplate;
//
//    @Value("${model.server.url}")
//    private String modelServerUrl;
//
//    /**
//     * STT로 변환된 텍스트를 분석하여 리포트 생성
//     */
//    @Transactional
//    public BattleReport analyzeSpeech(Long battleId, BattleAnalysisRequest request) {
//        Battle battle = battleRepository.findById(battleId)
//                .orElseThrow(() -> new EntityNotFoundException("Battle not found"));
//
//        // 1. STT 텍스트 저장
//        Speech speech = Speech.builder()
//                .battle(battle)
//                .user(request.getUser())
//                .content(request.getText())
//                .timestamp(LocalDateTime.now())
//                .build();
//        speechRepository.save(speech);
//
//        // 2. 감정 분석 요청
//        EmotionAnalysisResponse emotionAnalysis = analyzeSpeechEmotion(request.getText());
//
//        // 3. 논쟁 스타일 분석
//        DebateStyleAnalysis styleAnalysis = analyzeDebateStyle(request.getText());
//
//        // 4. 리포트 생성
//        BattleReport report = BattleReport.builder()
//                .battle(battle)
//                .user(request.getUser())
//                .emotions(emotionAnalysis.getEmotions())
//                .debateStyle(styleAnalysis.getStyle())
//                .summary(generateSummary(emotionAnalysis, styleAnalysis))
//                .timestamp(LocalDateTime.now())
//                .build();
//
//        // 5. 웹소켓으로 실시간 분석 결과 전송
//        sendRealtimeAnalysis(battle.getId(), report);
//
//        return report;
//    }
//
//    private EmotionAnalysisResponse analyzeSpeechEmotion(String text) {
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        Map<String, String> requestBody = new HashMap<>();
//        requestBody.put("text", text);
//
//        HttpEntity<Map<String, String>> request =
//                new HttpEntity<>(requestBody, headers);
//
//        return restTemplate.postForObject(
//                modelServerUrl + "/analyze/emotion",
//                request,
//                EmotionAnalysisResponse.class
//        );
//    }
//
//    private DebateStyleAnalysis analyzeDebateStyle(String text) {
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        Map<String, String> requestBody = new HashMap<>();
//        requestBody.put("text", text);
//
//        HttpEntity<Map<String, String>> request =
//                new HttpEntity<>(requestBody, headers);
//
//        return restTemplate.postForObject(
//                modelServerUrl + "/analyze/style",
//                request,
//                DebateStyleAnalysis.class
//        );
//    }
//
//    private String generateSummary(
//            EmotionAnalysisResponse emotionAnalysis,
//            DebateStyleAnalysis styleAnalysis
//    ) {
//        StringBuilder summary = new StringBuilder();
//
//        // 감정 분석 요약
//        summary.append("# 감정 분석\n");
//        emotionAnalysis.getEmotions().forEach((emotion, value) -> {
//            summary.append(String.format("%s: %.1f%%\n", emotion, value * 100));
//        });
//
//        // 논쟁 스타일 분석
//        summary.append("\n# 논쟁 스타일\n");
//        String dominantStyle = styleAnalysis.getDominantStyle();
//        summary.append(String.format("%s 스타일의 토론가입니다.\n", dominantStyle));
//
//        // 조언 추가
//        if (emotionAnalysis.getEmotions().get("분노") > 0.5) {
//            summary.append("\n💡 조언: 감정을 조금 더 차분히 다스려보세요.");
//        }
//
//        return summary.toString();
//    }
//
//    private void sendRealtimeAnalysis(Long battleId, BattleReport report) {
//        webSocket.convertAndSend(
//                "/topic/battle/" + battleId + "/analysis",
//                report
//        );
//    }
//}