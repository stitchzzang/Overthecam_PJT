//package com.overthecam.battle.service;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class OpenViduService {
//
//    private final RestTemplate restTemplate;
//    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 변환기
//
//    @Value("${openvidu.url}") // 환경 변수에서 가져오기
//    private String openviduUrl;
//    @Value("${openvidu.secret}")
//    private String openviduSecret;
//
//    /**
//     * OpenVidu 세션 생성 (REST API 직접 호출)
//     */
//    public String createSession() {
//        try {
//            String url = openviduUrl + "/openvidu/api/sessions";
//            HttpHeaders headers = createHeaders();
//
//            Map<String, Object> request = new HashMap<>();
//            request.put("mediaMode", "ROUTED");
//
//            String jsonRequest = objectMapper.writeValueAsString(request);
//            HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);
//
//            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
//            log.info("OpenVidu 세션 생성 성공: {}", response.getBody());
//            return extractSessionId(response.getBody());
//        } catch (Exception e) {
//            log.error("OpenVidu 세션 생성 실패: {}", e.getMessage());
//            throw new RuntimeException("OpenVidu 세션 생성 실패", e);
//        }
//    }
//
//    /**
//     * PUBLISHER 토큰 생성
//     */
//    public String createPublisherConnection(String sessionId) {
//        try {
//            String url = openviduUrl + "/openvidu/api/sessions/" + sessionId + "/connection";
//            HttpHeaders headers = createHeaders();
//
//            Map<String, Object> request = new HashMap<>();
//            request.put("role", "PUBLISHER");  // 방송 송출 권한
//            request.put("kurentoOptions", Map.of("allowedFilters", new String[]{})); // 추가적인 필터 설정 가능
//
//            String jsonRequest = objectMapper.writeValueAsString(request);
//            HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);
//
//            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
//            log.info("PUBLISHER 토큰 생성 성공 | sessionId: {} | Token: {}", sessionId, response.getBody());
//            return extractToken(response.getBody());
//        } catch (Exception e) {
//            log.error("PUBLISHER 토큰 생성 실패: {}", e.getMessage());
//            throw new RuntimeException("PUBLISHER 토큰 생성 실패", e);
//        }
//    }
//
//    /**
//     * OpenVidu 세션 종료
//     */
//    public boolean closeSession(String sessionId) {
//        try {
//            String url = openviduUrl + "/openvidu/api/sessions/" + sessionId;
//            HttpHeaders headers = createHeaders();
//            HttpEntity<String> entity = new HttpEntity<>(headers);
//
//            ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, Void.class);
//            log.info("OpenVidu 세션 종료 완료 | sessionId: {}", sessionId);
//            return true;
//        } catch (Exception e) {
//            log.error("OpenVidu 세션 종료 실패 | sessionId: {} | 오류: {}", sessionId, e.getMessage());
//            return false;
//        }
//    }
//
//    /**
//     * 세션이 종료되었는지 확인
//     */
//    public boolean isSessionClosed(String sessionId) {
//        try {
//            String url = openviduUrl + "/openvidu/api/sessions/" + sessionId;
//            HttpHeaders headers = createHeaders();
//            HttpEntity<String> entity = new HttpEntity<>(headers);
//
//            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
//            return response.getStatusCode() != HttpStatus.OK;
//        } catch (Exception e) {
//            log.warn("OpenVidu 세션 확인 중 오류 발생 | sessionId: {} | 오류: {}", sessionId, e.getMessage());
//            return true; // 오류 발생 시 세션이 종료된 것으로 간주
//        }
//    }
//
//    /**
//     * HTTP 요청 헤더 생성 (인증 포함)
//     */
//    private HttpHeaders createHeaders() {
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        headers.setBasicAuth("OPENVIDUAPP", openviduSecret);
//        return headers;
//    }
//
//    /**
//     * OpenVidu 응답에서 sessionId 추출
//     */
//    private String extractSessionId(String responseBody) {
//        try {
//            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
//            return responseMap.get("id").toString();
//        } catch (Exception e) {
//            throw new RuntimeException("세션 ID 추출 실패", e);
//        }
//    }
//
//    /**
//     * OpenVidu 응답에서 토큰 추출
//     */
//    private String extractToken(String responseBody) {
//        try {
//            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
//            return responseMap.get("token").toString();
//        } catch (Exception e) {
//            throw new RuntimeException("토큰 추출 실패", e);
//        }
//    }
//}
