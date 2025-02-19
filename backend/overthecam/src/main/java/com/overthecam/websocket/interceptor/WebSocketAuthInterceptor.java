package com.overthecam.websocket.interceptor;

import com.overthecam.auth.service.TokenService;
import com.overthecam.security.jwt.JwtProperties;
import com.overthecam.security.jwt.JwtTokenProvider;
import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;

import com.overthecam.websocket.service.WebSocketSessionService;
import java.util.HashMap;
import java.util.Map;

import com.overthecam.websocket.dto.UserPrincipal;
import io.jsonwebtoken.ExpiredJwtException;
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

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;
    private final WebSocketSessionService webSocketSessionService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("StompCommand.CONNECT 요청 수신 - sessionId: {}", accessor.getSessionId());
            return handleConnect(message, accessor);
        }
        else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            log.debug("StompCommand.SUBSCRIBE 요청 수신 - destination: {}", accessor.getDestination());
        }
        else if (StompCommand.SEND.equals(accessor.getCommand())) {
            log.debug("StompCommand.SEND 요청 수신 - destination: {}", accessor.getDestination());
            log.debug("메시지 내용: {}", message.getPayload());  // 추가
            log.debug("메시지 헤더: {}", message.getHeaders());  // 추가
            return handleSend(message);
        }
        else if(StompCommand.DISCONNECT.equals(accessor.getCommand())){
            log.debug("StompCommand.DISCONNECT 요청 수신 - sessionId: {}", accessor.getSessionId());
            handleDisconnect(accessor);
        }

        return message;
    }

    private void handleDisconnect(StompHeaderAccessor accessor) {
        try {
            String sessionId = accessor.getSessionId();
            webSocketSessionService.removeSession(sessionId);  // 세션 제거

            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.clear();
            }
            log.debug("WebSocket 세션 정리 완료 - sessionId: {}", sessionId);
        } catch (Exception e) {
            log.warn("세션 정리 중 예외 발생", e);
        }
    }

    private Message<?> handleConnect(Message<?> message, StompHeaderAccessor accessor) {
        validateAndSetupUser(accessor);
        return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
    }

    private Message<?> handleSend(Message<?> message) {
        StompHeaderAccessor existingAccessor = StompHeaderAccessor.wrap(message);
        UserPrincipal user = (UserPrincipal) existingAccessor.getUser();

        if (user == null) {
            user = restoreUserFromSession(existingAccessor);
            if (user != null) {
                existingAccessor.setUser(user);
                return MessageBuilder.createMessage(message.getPayload(), existingAccessor.getMessageHeaders());
            }
        }
        return message;
    }

    private UserPrincipal restoreUserFromSession(StompHeaderAccessor accessor) {
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes == null) {
            return null;
        }

        Long userId = (Long) sessionAttributes.get("userId");
        String email = (String) sessionAttributes.get("email");
        String nickname = (String) sessionAttributes.get("nickname");

        if (userId != null && email != null && nickname != null) {
            return new UserPrincipal(userId, email, nickname);
        }
        return null;
    }

    private void validateAndSetupUser(StompHeaderAccessor accessor) {
        String bearerToken = extractAndValidateToken(accessor);

        // 토큰 유효성 및 블랙리스트 확인
        if (!jwtTokenProvider.validateToken(bearerToken) || tokenService.isBlacklisted(bearerToken)) {
            throw new WebSocketException(WebSocketErrorCode.INVALID_TOKEN_SIGNATURE,
                "무효화된 토큰입니다. 다시 로그인해주세요.");
        }

        UserPrincipal principal = authenticateToken(bearerToken);
        setupUserSession(accessor, principal);
    }

    private String extractAndValidateToken(StompHeaderAccessor accessor) {
        String bearerToken = accessor.getFirstNativeHeader("Authorization");
        log.debug("수신된 Authorization 헤더: {}", bearerToken);

        if (bearerToken == null) {
            throw new WebSocketException(WebSocketErrorCode.TOKEN_NOT_FOUND,
                "WebSocket 연결을 위한 인증 토큰이 필요합니다");
        }

        if (!bearerToken.startsWith(JwtProperties.TYPE)) {
            throw new WebSocketException(WebSocketErrorCode.MALFORMED_TOKEN,
                "Bearer 토큰 형식이 아닙니다");
        }

        return bearerToken.substring(JwtProperties.TYPE.length());
    }

    private UserPrincipal authenticateToken(String token) {
        try {
            if (!jwtTokenProvider.validateToken(token)) {
                throw new WebSocketException(WebSocketErrorCode.INVALID_TOKEN_SIGNATURE,
                    "유효하지 않은 토큰입니다");
            }

            String email = jwtTokenProvider.getEmail(token);
            Long userId = jwtTokenProvider.getUserId(token);
            String nickname = jwtTokenProvider.getNickname(token);

            return new UserPrincipal(userId, email, nickname);
        } catch (ExpiredJwtException e) {
            log.error("토큰이 만료됨", e);
            throw new WebSocketException(WebSocketErrorCode.EXPIRED_ACCESS_TOKEN,
                "액세스 토큰이 만료되었습니다. 토큰을 갱신해주세요.");
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            log.error("잘못된 형식의 토큰", e);
            throw new WebSocketException(WebSocketErrorCode.MALFORMED_TOKEN,
                "잘못된 형식의 토큰입니다");
        } catch (Exception e) {
            log.error("토큰 검증 중 오류 발생", e);
            throw new WebSocketException(WebSocketErrorCode.INVALID_TOKEN_SIGNATURE,
                "토큰 검증 중 오류가 발생했습니다");
        }
    }

    private void setupUserSession(StompHeaderAccessor accessor, UserPrincipal principal) {
        // Principal 설정
        accessor.setUser(principal);

        // 세션 속성 설정
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("userId", principal.getUserId());
        attributes.put("email", principal.getEmail());
        attributes.put("nickname", principal.getNickname());
        accessor.setSessionAttributes(attributes);

        // WebSocketSession 등록
        webSocketSessionService.registerSession(accessor.getSessionId(), principal.getUserId());


        log.debug("WebSocket 인증 성공 - 사용자: {}, Principal: {}, SessionAttributes: {}",
            principal.getEmail(), principal, attributes);
    }
}