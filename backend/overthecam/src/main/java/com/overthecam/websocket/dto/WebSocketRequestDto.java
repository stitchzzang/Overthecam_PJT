package com.overthecam.websocket.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

// 공통 요청 객체
@Getter
@Builder
public class WebSocketRequestDto<T> {
    private Long battleId;  // 배틀 관련 메시지에만 사용
    private MessageType type;
    private T data;

    // 채팅 메시지 요청
    public static WebSocketRequestDto<ChatMessageRequest> chat(Long battleId, String content) {
        return WebSocketRequestDto.<ChatMessageRequest>builder()
                .type(MessageType.CHAT)
                .battleId(battleId)
                .data(new ChatMessageRequest(content, LocalDateTime.now()))
                .build();
    }

    // 배틀 시작 요청
    public static WebSocketRequestDto<Void> battleStart(Long battleId) {
        return WebSocketRequestDto.<Void>builder()
                .type(MessageType.BATTLE_START)
                .battleId(battleId)
                .build();
    }

}
