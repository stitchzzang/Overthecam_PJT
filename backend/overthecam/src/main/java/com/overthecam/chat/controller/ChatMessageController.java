package com.overthecam.chat.controller;

import com.overthecam.chat.dto.ChatMessageRequest;
import com.overthecam.chat.dto.ChatMessageResponse;
import com.overthecam.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat/{chatRoomId}") // "클라이언트는 /api/publish/chat/{chatRoomId}" 주소로 발행된 메시지를
    @SendTo("/api/subscribe/chat/{chatRoomId}") // "/api/subscribe/chat/{chatRoomId}"를 구독한 사용자에게 전달
    public ChatMessageResponse sendMessage(ChatMessageRequest request, @DestinationVariable Long chatRoomId){

        log.info("[Chat Message] Received message - Room ID: {}, Username: {}, Content: {}",
            chatRoomId, request.getUsername(), request.getContent());

        return chatMessageService.sendMessage(request, chatRoomId);
    }
}
