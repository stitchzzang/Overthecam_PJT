package com.overthecam.battle.service;

import io.openvidu.java.client.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OpenViduService {

    // OpenVidu 서버와의 연결을 위한 클라이언트 객체
    private final OpenVidu openVidu;

    //OpenVidu 화상 채팅 세션 생성
    public Session createSession() throws OpenViduJavaClientException, OpenViduHttpException {
        SessionProperties properties = new SessionProperties.Builder().build();
        return openVidu.createSession(properties);
    }

    /**
     * 일반 참가자용 토큰 생성 (SUBSCRIBER - 시청자 모드)
     * 비디오/오디오 OFF 상태로 시작
     */
    public String createConnection(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
        Session session = openVidu.getActiveSession(sessionId);

        ConnectionProperties properties = new ConnectionProperties.Builder()
                .type(ConnectionType.WEBRTC)
                .role(OpenViduRole.SUBSCRIBER)  // 시청자 권한
                .data("{\"clientData\": \"Subscriber\"}")
                .build();

        Connection connection = session.createConnection(properties);
        return connection.getToken();
    }

    /**
     * 배틀러용 토큰 생성 (PUBLISHER - 방송 송출 모드)
     * 비디오/오디오 ON 가능한 상태로 시작
     */
    public String createPublisherConnection(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
        Session session = openVidu.getActiveSession(sessionId);

        ConnectionProperties properties = new ConnectionProperties.Builder()
                .type(ConnectionType.WEBRTC)
                .role(OpenViduRole.PUBLISHER)  // 방송 송출 권한
                .data("{\"clientData\": \"Publisher\"}")
                .build();

        Connection connection = session.createConnection(properties);
        return connection.getToken();
    }


}
