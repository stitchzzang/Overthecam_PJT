package com.overthecam.websocket.service;

import com.overthecam.auth.dto.TokenInvalidatedEvent;
import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketSessionService {
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @lombok.Value
    private static class WebSocketSession {
        Long userId;
        String token;
    }

    @EventListener
    public void handleTokenInvalidated(TokenInvalidatedEvent event) {
        String token = event.getToken();
        Long userId = event.getUserId();

        List<String> sessionsToDisconnect = sessions.entrySet().stream()
            .filter(entry -> token.equals(entry.getValue().getToken()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());

        for (String sessionId : sessionsToDisconnect) {
            try {
                sendForceDisconnectMessage(sessionId);
                removeSession(sessionId);
                log.info("토큰 무효화로 인한 웹소켓 세션 종료 - Session ID: {}, User ID: {}", sessionId, userId);
            } catch (Exception e) {
                log.error("웹소켓 세션 종료 처리 실패 - Session ID: {}", sessionId, e);
            }
        }
    }

    public void registerSession(String sessionId, Long userId, String token) {
        List<String> existingSessions = findSessionsByUserId(userId);

        if (!existingSessions.isEmpty()) {
            for (String existingSessionId : existingSessions) {
                try {
                    sendForceDisconnectMessage(existingSessionId);
                    removeSession(existingSessionId);
                } catch (Exception e) {
                    log.error("기존 세션 종료 중 오류 발생 - Session ID: {}", existingSessionId, e);
                }
            }
            log.info("기존 WebSocket 세션들 종료 처리 완료 - User ID: {}", userId);
        }

        sessions.put(sessionId, new WebSocketSession(userId, token));
        log.info("새로운 WebSocket 세션 등록 - Session ID: {}, User ID: {}", sessionId, userId);
    }

    public void removeSession(String sessionId) {
        WebSocketSession session = sessions.remove(sessionId);
        if (session != null) {
            log.info("WebSocket 세션 제거 완료 - Session ID: {}, User ID: {}", sessionId, session.getUserId());
        }
    }

    public List<String> findSessionsByUserId(Long userId) {
        return sessions.entrySet().stream()
            .filter(entry -> userId.equals(entry.getValue().getUserId()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    private void sendForceDisconnectMessage(String sessionId) {
        try {
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