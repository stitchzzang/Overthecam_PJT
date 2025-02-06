package com.overthecam.chat.controller;

import com.overthecam.chat.dto.ChatMessageRequest;
import com.overthecam.chat.service.ChatMessageService;
import com.overthecam.websocket.dto.UserPrincipal;
import com.overthecam.websocket.dto.WebSocketResponseDto;
import com.overthecam.websocket.util.WebSocketSecurityUtils;
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
//        log.debug("Message received - Headers: {}", headerAccessor.getMessageHeaders());

        UserPrincipal user = WebSocketSecurityUtils.getUser(headerAccessor);


        return chatMessageService.sendMessage(request, battleId, user);
    }
}