package com.overthecam.chat.controller;

import com.overthecam.chat.dto.ChatMessageRequest;
import com.overthecam.chat.service.ChatMessageService;
import com.overthecam.exception.websocket.WebSocketErrorCode;
import com.overthecam.exception.websocket.WebSocketException;
import com.overthecam.websocket.dto.UserPrincipal;
import com.overthecam.websocket.dto.WebSocketResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat/{battleId}")
    @SendTo("/api/subscribe/chat/{battleId}")
    public WebSocketResponseDto<?> sendMessage(ChatMessageRequest request, @DestinationVariable Long battleId, SimpMessageHeaderAccessor headerAccessor){
        log.debug("Message received - Headers: {}", headerAccessor.getMessageHeaders());
        UserPrincipal user = (UserPrincipal) headerAccessor.getUser();
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();

        log.debug("User from Principal: {}", user);
        log.debug("SessionAttributes: {}", sessionAttributes);

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

        return chatMessageService.sendMessage(request, battleId, user);
    }
}