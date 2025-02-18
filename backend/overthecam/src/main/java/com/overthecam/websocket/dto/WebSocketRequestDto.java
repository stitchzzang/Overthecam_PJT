package com.overthecam.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// 공통 요청 객체
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketRequestDto<T> {
    private MessageType type;
    private T data;

    // 채팅 메시지 요청
    public static WebSocketRequestDto<ChatMessageRequest> chat(String content) {
        return WebSocketRequestDto.<ChatMessageRequest>builder()
                .type(MessageType.CHAT)
                .data(new ChatMessageRequest(content, LocalDateTime.now()))
                .build();
    }

    // 배틀 시작 요청
    public static WebSocketRequestDto<Void> battleStart() {
        return WebSocketRequestDto.<Void>builder()
                .type(MessageType.BATTLE_START)
                .build();
    }

}
