package com.overthecam.battle.service;

import io.openvidu.java.client.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenViduService {

    // OpenVidu 서버와의 연결을 위한 클라이언트 객체
    private final OpenVidu openVidu;

    //OpenVidu 화상 채팅 세션 생성
    public Session createSession() {
        try {
            SessionProperties properties = new SessionProperties.Builder()
                    .mediaMode(MediaMode.ROUTED)
                    .recordingMode(RecordingMode.MANUAL)
                    .defaultRecordingProperties(new RecordingProperties.Builder()
                            .outputMode(Recording.OutputMode.COMPOSED)
                            .hasAudio(true)
                            .hasVideo(true)
                            .resolution("1280x720")
                            .frameRate(25)
                            .build())
                    .build();

            // 세션 생성 시도
            Session session = openVidu.createSession(properties);

            // 성공 로그
            log.info("OpenVidu 세션 생성 성공. Session ID: {}", session.getSessionId());

            return session;

        } catch (OpenViduJavaClientException e) {
            // OpenVidu Java 클라이언트 관련 예외
            log.error("OpenVidu 클라이언트 예외 발생: ", e);
            log.error("예외 메시지: {}", e.getMessage());
            throw new RuntimeException("OpenVidu 세션 생성 실패: 클라이언트 예외", e);

        } catch (OpenViduHttpException e) {
            // HTTP 통신 관련 예외
            log.error("OpenVidu HTTP 예외 발생. 상태 코드: {}", e.getStatus());
            log.error("예외 메시지: {}", e.getMessage());

            // HTTP 상태 코드별 구체적인 에러 메시지
            String errorMessage = switch (e.getStatus()) {
                case 400 -> "잘못된 세션 설정값이 전달되었습니다.";
                case 409 -> "이미 존재하는 세션 ID입니다.";
                case 401, 403 -> "OpenVidu 서버 인증 실패. Secret key를 확인해주세요.";
                default -> "OpenVidu 서버 연결 중 오류가 발생했습니다.";
            };

            throw new RuntimeException(errorMessage, e);
        }
    }

    /**
     * 일반 참가자용 토큰 생성 (SUBSCRIBER - 시청자 모드)
     * 비디오/오디오 OFF 상태로 시작
     */
//    public String createConnection(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
//        Session session = openVidu.getActiveSession(sessionId);
//
//        ConnectionProperties properties = new ConnectionProperties.Builder()
//                .type(ConnectionType.WEBRTC)
//                .role(OpenViduRole.SUBSCRIBER)  // 시청자 권한
//                .data("{\"clientData\": \"Subscriber\"}")
//                .build();
//
//        Connection connection = session.createConnection(properties);
//        return connection.getToken();
//    }

    /**
     * 배틀러용 토큰 생성 (PUBLISHER - 방송 송출 모드)
     * 비디오/오디오 ON 가능한 상태로 시작
     */
    public String createPublisherConnection(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
        Session session = openVidu.getActiveSession(sessionId);

        if (session == null) {
            log.warn("세션 {}이(가) 메모리에 존재하지 않음. OpenVidu 서버에서 다시 가져옵니다.", sessionId);
        }

        ConnectionProperties properties = new ConnectionProperties.Builder()
                .type(ConnectionType.WEBRTC)
                .role(OpenViduRole.PUBLISHER)  // 방송 송출 권한
                .data("{\"clientData\": \"Publisher\"}")
                .build();

        Connection connection = session.createConnection(properties);
        return connection.getToken();
    }
}
