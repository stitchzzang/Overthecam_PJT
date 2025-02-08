package com.overthecam.websocket.util;

import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;
import com.overthecam.websocket.dto.UserPrincipal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketSecurityUtils {

    public static UserPrincipal getUser(SimpMessageHeaderAccessor headerAccessor) {
        UserPrincipal user = (UserPrincipal) headerAccessor.getUser();
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();

        //        log.debug("User from Principal: {}", user);
        //        log.debug("SessionAttributes: {}", sessionAttributes);

        if (user == null && sessionAttributes != null) {
            Long userId = (Long) sessionAttributes.get("userId");
            String email = (String) sessionAttributes.get("email");
            String nickname = (String) sessionAttributes.get("nickname");

            if (userId != null && email != null && nickname != null) {
                user = new UserPrincipal(userId, email, nickname);
            }
        }

        if (user == null) {
            throw new WebSocketException(WebSocketErrorCode.UNAUTHORIZED_CHAT_ACCESS, "사용자 정보를 찾을 수 없습니다."
            );
        }

        return user;
    }
}
