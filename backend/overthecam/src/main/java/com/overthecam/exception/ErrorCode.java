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
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다"),

    // 회원가입 에러
    EMAIL_INVALID(HttpStatus.BAD_REQUEST, "유효하지 않은 이메일 형식입니다"),
    PASSWORD_VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "비밀번호는 8~20자리수여야 합니다. 영문 대소문자, 숫자, 특수문자를 1개 이상 포함해야 합니다"),
    NICKNAME_INVALID(HttpStatus.BAD_REQUEST, "닉네임은 2자 이상 10자 이하여야 합니다"),
    GENDER_INVALID(HttpStatus.BAD_REQUEST, "성별은 여성 또는 남성이어야 합니다"),
    BIRTH_INVALID(HttpStatus.BAD_REQUEST, "생년월일은 과거 날짜여야 합니다"),
    PHONE_INVALID(HttpStatus.BAD_REQUEST, "올바른 전화번호 형식은 010-0000-0000입니다"),

    REFRESH_TOKEN_MISMATCH(HttpStatus.UNAUTHORIZED, "저장된 리프레시 토큰과 일치하지 않습니다"),
    TOKEN_VALIDATION_FAILED(HttpStatus.UNAUTHORIZED, "토큰 검증에 실패했습니다"),

    // 로그인 에러
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 등록된 이메일입니다"),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다"),


    // 채팅 관련 에러 추가
    CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다"),
    BATTLE_NOT_FOUND(HttpStatus.NOT_FOUND, "배틀이 존재하지 않습니다"),
    UNAUTHORIZED_CHAT_ACCESS(HttpStatus.FORBIDDEN, "채팅방 접근 권한이 없습니다"),
    CHAT_ROOM_INACTIVE(HttpStatus.BAD_REQUEST, "비활성화된 채팅방입니다");


    private final HttpStatus httpStatus;
    private final String message;
}
