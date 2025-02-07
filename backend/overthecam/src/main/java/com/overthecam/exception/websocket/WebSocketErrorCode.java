package com.overthecam.exception.websocket;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum WebSocketErrorCode {

    // 채팅방 에러
    BATTLE_NOT_FOUND("WS-002", "배틀을 찾을 수 없습니다"),
    UNAUTHORIZED_CHAT_ACCESS("WS-003", "채팅방 접근 권한이 없습니다"),
    BATTLE_ROOM_INACTIVE("WS-004", "이미 종료된 배틀방입니다."),

    // WebSocket 인증 관련 에러
    TOKEN_NOT_FOUND("WS-401", "Authorization 헤더가 없습니다"),
    INVALID_TOKEN_FORMAT("WS-402", "잘못된 토큰 형식입니다"),
    INVALID_TOKEN("WS-403", "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN("WS-404", "만료된 토큰입니다"),

    UNAUTHORIZED_USER_ACCESS("WS-405", "올바르지 않은 사용자 정보입니다"),
    INVALID_MESSAGE_FORMAT("WS-406", "올바르지 않은 메시지 타입입니다."),

    // 사용자 응원 및 포인트 에러
    INSUFFICIENT_SCORE("WS-005", "응원점수가 부족합니다"),
    INSUFFICIENT_POINTS("WS-006", "포인트가 부족합니다");

    private final String code;
    private final String message;

}
