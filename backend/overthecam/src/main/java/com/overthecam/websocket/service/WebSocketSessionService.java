package com.overthecam.websocket.service;

import com.overthecam.websocket.dto.UserPrincipal;
import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketSessionService {
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Long> sessions = new ConcurrentHashMap<>();

    public void registerSession(String sessionId, Long userId) {
        // 기존 세션이 있는지 확인
        List<String> existingSessions = findSessionsByUserId(userId);

        // 기존 세션들에 강제 종료 메시지 전송 및 세션 제거
        if (!existingSessions.isEmpty()) {
            for (String existingSessionId : existingSessions) {
                try {
                    // 강제 종료 메시지 전송
                    sendForceDisconnectMessage(existingSessionId);
                    // 세션 제거
                    removeSession(existingSessionId);
                } catch (Exception e) {
                    log.error("기존 세션 종료 중 오류 발생 - Session ID: {}", existingSessionId, e);
                }
            }
            log.info("기존 WebSocket 세션들 종료 처리 완료 - User ID: {}", userId);
        }

        // 새로운 세션 등록
        sessions.put(sessionId, userId);
        log.info("새로운 WebSocket 세션 등록 - Session ID: {}, User ID: {}", sessionId, userId);
    }

    public void removeSession(String sessionId) {
        Long userId = sessions.remove(sessionId);
        if (userId != null) {
            log.info("WebSocket 세션 제거 완료 - Session ID: {}, User ID: {}", sessionId, userId);
        }
    }

    public List<String> findSessionsByUserId(Long userId) {
        return sessions.entrySet().stream()
            .filter(entry -> userId.equals(entry.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    private void sendForceDisconnectMessage(String sessionId) {
        try {
            // 클라이언트에게 강제 종료 메시지 전송
            messagingTemplate.convertAndSendToUser(
                sessionId,
                "/queue/errors",
                new WebSocketException(
                    WebSocketErrorCode.DUPLICATE_LOGIN,
                    "다른 기기에서 로그인이 감지되어 연결이 종료됩니다."
                )
            );
        } catch (Exception e) {
            log.error("강제 종료 메시지 전송 실패 - Session ID: {}", sessionId, e);
        }
    }

    public boolean isSessionValid(String sessionId) {
        return sessions.containsKey(sessionId);
    }
}