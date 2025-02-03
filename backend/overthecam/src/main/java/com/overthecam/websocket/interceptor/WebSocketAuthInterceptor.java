package com.overthecam.websocket.interceptor;

import com.overthecam.security.jwt.JwtProperties;
import com.overthecam.security.jwt.JwtTokenProvider;
import com.overthecam.exception.websocket.WebSocketErrorCode;
import com.overthecam.exception.websocket.WebSocketException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider tokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand()) ||
            StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            log.debug("StompCommand.CONNECT 요청 수신");

            log.debug("헤더 전체 확인: {}", accessor.toNativeHeaderMap());
            log.debug("메시지 전체 확인: {}", message);
            String bearerToken = accessor.getFirstNativeHeader("Authorization");
            log.debug("수신된 Authorization 헤더: {}", bearerToken);

            if (bearerToken == null) {
                log.error("토큰이 없음");
                throw new WebSocketException(WebSocketErrorCode.TOKEN_NOT_FOUND,
                    "WebSocket 연결을 위한 인증 토큰이 필요합니다");
            }

            if (!bearerToken.startsWith(JwtProperties.TYPE)) {
                log.error("잘못된 토큰 형식: {}", bearerToken);
                throw new WebSocketException(WebSocketErrorCode.INVALID_TOKEN_FORMAT,
                    "Bearer 토큰 형식이 아닙니다");
            }

            String token = bearerToken.substring(JwtProperties.TYPE.length());
            log.debug("토큰 추출: {}", token);

            try {
                if (!tokenProvider.validateToken(token)) {
                    log.error("유효하지 않은 토큰");
                    throw new WebSocketException(WebSocketErrorCode.INVALID_TOKEN,
                        "유효하지 않은 토큰입니다");
                }

                String email = tokenProvider.getEmail(token);
                Long userId = tokenProvider.getUserId(token);
                log.debug("토큰 검증 성공 - 사용자: {}, ID: {}", email, userId);

                accessor.setUser(() -> email);
                accessor.setSessionAttributes(Map.of(
                    "userId", userId,
                    "email", email
                ));

                log.info("WebSocket 연결 성공 - 사용자: {}", email);
            } catch (Exception e) {
                log.error("토큰 검증 중 오류 발생", e);
                throw new WebSocketException(WebSocketErrorCode.INVALID_TOKEN,
                    "토큰 검증 중 오류가 발생했습니다");
            }
        }

        return message;
    }
}