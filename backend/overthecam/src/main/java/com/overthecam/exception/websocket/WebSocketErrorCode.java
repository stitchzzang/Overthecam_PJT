package com.overthecam.exception.websocket;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum WebSocketErrorCode {

    // 채팅방 에러
    CHAT_ROOM_NOT_FOUND("WS-001", "채팅방을 찾을 수 없습니다"),
    BATTLE_NOT_FOUND("WS-002", "배틀을 찾을 수 없습니다"),
    UNAUTHORIZED_CHAT_ACCESS("WS-003", "채팅방 접근 권한이 없습니다"),
    CHAT_ROOM_INACTIVE("WS-004", "비활성화된 채팅방입니다"),

    // WebSocket 인증 관련 에러
    TOKEN_NOT_FOUND("WS-401", "Authorization 헤더가 없습니다"),
    INVALID_TOKEN_FORMAT("WS-402", "잘못된 토큰 형식입니다"),
    INVALID_TOKEN("WS-403", "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN("WS-404", "만료된 토큰입니다");

    private final String code;
    private final String message;

}
