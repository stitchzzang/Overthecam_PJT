package com.overthecam.websocket.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketSessionService {
    // sessionId를 키로 하고 userId를 값으로 저장
    private final Map<String, Long> sessions = new ConcurrentHashMap<>();

    public void registerSession(String sessionId, Long userId) {
        sessions.put(sessionId, userId);
        log.info("WebSocket 세션 등록 - Session ID: {}, User ID: {}", sessionId, userId);
    }

    public void removeSession(String sessionId) {
        Long userId = sessions.remove(sessionId);
        if (userId != null) {
            log.info("WebSocket 세션 제거 - Session ID: {}, User ID: {}", sessionId, userId);
        }
    }

    // 특정 사용자의 모든 세션ID 찾기
    public List<String> findSessionsByUserId(Long userId) {
        return sessions.entrySet().stream()
            .filter(entry -> userId.equals(entry.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
}