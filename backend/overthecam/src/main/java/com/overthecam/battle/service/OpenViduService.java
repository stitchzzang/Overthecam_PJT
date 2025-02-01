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

    //특정 세션에 대한 사용자 토큰 생성
    //클라이언트가 OpenVidu 세션에 접속할 때 사용
    public String createConnection(String sessionId) throws OpenViduJavaClientException, OpenViduHttpException {
        // 주어진 세션 ID로 활성 세션을 조회
        Session session = openVidu.getActiveSession(sessionId);
        ConnectionProperties properties = new ConnectionProperties.Builder()
                .type(ConnectionType.WEBRTC)
                .role(OpenViduRole.PUBLISHER)
                .build();
        Connection connection = session.createConnection(properties);
        return connection.getToken();
    }


}
