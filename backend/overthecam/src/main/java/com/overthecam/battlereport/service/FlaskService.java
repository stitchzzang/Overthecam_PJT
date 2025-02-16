package com.overthecam.battlereport.service;

import com.overthecam.battlereport.dto.TextAnalysisRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@AllArgsConstructor
public class FlaskService {

    private static final String FLASK_URL = "http://localhost:5001/api/debate/analyze";
    private final RestTemplate restTemplate;
    private final RedisService redisService;

    /**
     * 텍스트를 Flask 서버로 전송하여 분석을 요청하고 결과를 받아옵니다.
     * 5분마다 수집된 텍스트를 Flask 서버가 3문장씩 분석하도록 합니다.
     *
     * @param userId 사용자 ID
     * @param text   분석할 텍스트 (5분간 수집된 텍스트)
     * @return Flask 서버의 분석 결과
     * @throws RuntimeException Flask 서버 통신 중 오류 발생 시
     */
    public String analyzeText(int userId) {

        try {

            // 테스트용 텍스트 예시
            String testText = "안녕하세요 오늘 회의 시작하겠습니다. " +
                    "첫 번째 안건은 프로젝트 진행 상황입니다. " +
                    "현재 개발이 80% 완료되었습니다. " +
                    "두 번째 안건은 다음 주 일정입니다. " +
                    "화요일에 중요한 미팅이 있습니다. " +
                    "모든 팀원들이 참석해주시기 바랍니다. " +
                    "마지막으로 금주의 목표에 대해 이야기하겠습니다. " +
                    "서버 안정성 테스트를 진행해야 합니다. " +
                    "다들 고생 많으셨고 회의 마치겠습니다.";

            // 분석 요청 객체 생성
            TextAnalysisRequest request = TextAnalysisRequest.builder()
                    .userId(userId)
                    .text(testText)
                    .build();

            // Flask 서버로 POST 요청 전송
            // ResponseEntity를 사용하여 응답 상태코드와 본문을 함께 처리
            ResponseEntity<String> response = restTemplate.postForEntity(
                    FLASK_URL,      // 요청 URL
                    request,        // 요청 본문
                    String.class    // 응답 타입
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                // Redis에 결과 저장
                redisService.saveAnalysisResultToRedis(userId, response.getBody());

                log.info("Successfully received and saved analysis from Flask for user {}", userId);
                return response.getBody();
            } else {
                // 정상 응답이 아닌 경우 예외 발생
                throw new RuntimeException("Flask server returned status: " + response.getStatusCode());
            }
        } catch (Exception e) {

            // 기타 예외 처리
            log.error("Unexpected error while processing text for user {}", userId, e);
            throw new RuntimeException("텍스트 분석 중 예상치 못한 오류가 발생했습니다", e);
        }


    }
}
