package com.overthecam.auth.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AuthErrorCode implements ErrorCode {
    // 회원가입 에러
    EMAIL_INVALID(400, "유효하지 않은 이메일 형식입니다"),
    PASSWORD_VALIDATION_ERROR(400, "비밀번호는 8~20자리수여야 합니다. 영문 대소문자, 숫자, 특수문자를 1개 이상 포함해야 합니다"),
    NICKNAME_INVALID(400, "닉네임은 2자 이상 10자 이하여야 합니다"),
    GENDER_INVALID(400, "성별은 여성 또는 남성이어야 합니다"),
    BIRTH_INVALID(400, "생년월일은 과거 날짜여야 합니다"),
    PHONE_INVALID(400, "올바른 전화번호 형식은 010-0000-0000입니다"),
    DUPLICATE_EMAIL(409, "이미 등록된 이메일입니다"),
    DUPLICATE_NICKNAME(409, "이미 등록된 닉네임입니다"),
    DUPLICATE_PHONE_NUMBER(409, "이미 등록된 전화번호입니다"),

    // 로그인 에러
    USER_NOT_FOUND(404, "사용자를 찾을 수 없습니다"),
    INVALID_PASSWORD(401, "비밀번호가 일치하지 않습니다"),
    CONCURRENT_LOGIN(400, "다른 기기에서 로그인이 감지되어 로그아웃됩니다."),

    //로그아웃 에러
    LOGOUT_UNAUTHORIZED(401, "로그아웃을 위해서는 로그인이 필요합니다"),
    LOGOUT_TOKEN_NOT_FOUND(400, "로그아웃 처리할 토큰을 찾을 수 없습니다"),
    LOGOUT_FAILED(500, "로그아웃 처리 중 오류가 발생했습니다"),


    // JWT 토큰 에러
    TOKEN_NOT_FOUND(401, "토큰이 존재하지 않습니다"),
    INVALID_TOKEN_SIGNATURE(401, "토큰 서명이 유효하지 않습니다"),
    MALFORMED_TOKEN(401, "잘못된 형식의 토큰입니다"),
    EXPIRED_ACCESS_TOKEN(401, "액세스 토큰이 만료되었습니다. 토큰을 갱신해주세요."),
    EXPIRED_REFRESH_TOKEN(401, "리프레시 토큰이 만료되었습니다. 재로그인이 필요합니다."),

    // 서버 에러
    SERVER_ERROR(500, "서버 내부 오류가 발생했습니다");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}