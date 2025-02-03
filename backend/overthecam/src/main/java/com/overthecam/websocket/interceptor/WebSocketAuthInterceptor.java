package com.overthecam.websocket.interceptor;

import com.overthecam.security.jwt.JwtProperties;
import com.overthecam.security.jwt.JwtTokenProvider;
import com.overthecam.exception.websocket.WebSocketErrorCode;
import com.overthecam.exception.websocket.WebSocketException;

import java.util.HashMap;
import java.util.Map;

import com.overthecam.websocket.dto.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider tokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("StompCommand.CONNECT 요청 수신");
            validateAndSetupUser(accessor);

            // 중요: accessor를 message에 다시 적용
            return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
        } else if (StompCommand.SEND.equals(accessor.getCommand())) {
            // SEND 커맨드일 때 기존 세션의 user 정보 복원
            StompHeaderAccessor existingAccessor = StompHeaderAccessor.wrap(message);
            UserPrincipal user = (UserPrincipal) existingAccessor.getUser();
            if (user == null) {
                // 세션에서 정보 복원 시도
                Map<String, Object> sessionAttributes = existingAccessor.getSessionAttributes();
                if (sessionAttributes != null) {
                    Long userId = (Long) sessionAttributes.get("userId");
                    String email = (String) sessionAttributes.get("email");
                    String nickname = (String) sessionAttributes.get("nickname");
                    if (userId != null && email != null && nickname != null) {
                        user = new UserPrincipal(userId, email, nickname);
                        existingAccessor.setUser(user);
                        return MessageBuilder.createMessage(message.getPayload(), existingAccessor.getMessageHeaders());
                    }
                }
            }
        }

        return message;
    }

    private void validateAndSetupUser(StompHeaderAccessor accessor) {
        String bearerToken = accessor.getFirstNativeHeader("Authorization");
        log.debug("수신된 Authorization 헤더: {}", bearerToken);

        if (bearerToken == null) {
            throw new WebSocketException(WebSocketErrorCode.TOKEN_NOT_FOUND,
                    "WebSocket 연결을 위한 인증 토큰이 필요합니다");
        }

        if (!bearerToken.startsWith(JwtProperties.TYPE)) {
            throw new WebSocketException(WebSocketErrorCode.INVALID_TOKEN_FORMAT,
                    "Bearer 토큰 형식이 아닙니다");
        }

        String token = bearerToken.substring(JwtProperties.TYPE.length());

        try {
            if (!tokenProvider.validateToken(token)) {
                throw new WebSocketException(WebSocketErrorCode.INVALID_TOKEN,
                        "유효하지 않은 토큰입니다");
            }

            String email = tokenProvider.getEmail(token);
            Long userId = tokenProvider.getUserId(token);
            String nickname = tokenProvider.getNickname(token);

            // Principal 설정
            UserPrincipal principal = new UserPrincipal(userId, email, nickname);
            accessor.setUser(principal);

            // 세션 속성 설정
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("userId", userId);
            attributes.put("email", email);
            attributes.put("nickname", nickname);
            accessor.setSessionAttributes(attributes);

            log.debug("WebSocket 인증 성공 - 사용자: {}, Principal: {}, SessionAttributes: {}",
                    email, principal, attributes);

        } catch (Exception e) {
            log.error("토큰 검증 중 오류 발생", e);
            throw new WebSocketException(WebSocketErrorCode.INVALID_TOKEN,
                    "토큰 검증 중 오류가 발생했습니다");
        }
    }
}