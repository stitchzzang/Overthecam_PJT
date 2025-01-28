package com.overthecam.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 공통 에러
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "잘못된 입력값입니다"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다"),

    // 회원 관련 에러
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 등록된 이메일입니다"),


    // 채팅 관련 에러 추가
    CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다"),
    BATTLE_NOT_FOUND(HttpStatus.NOT_FOUND, "배틀이 존재하지 않습니다"),
    UNAUTHORIZED_CHAT_ACCESS(HttpStatus.FORBIDDEN, "채팅방 접근 권한이 없습니다"),
    CHAT_ROOM_INACTIVE(HttpStatus.BAD_REQUEST, "비활성화된 채팅방입니다");


    private final HttpStatus httpStatus;
    private final String message;
}
