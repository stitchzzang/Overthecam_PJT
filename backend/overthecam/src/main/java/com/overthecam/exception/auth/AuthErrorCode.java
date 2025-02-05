//package com.overthecam.exception.auth;
//
//import lombok.Getter;
//import lombok.RequiredArgsConstructor;
//
//@Getter
//@RequiredArgsConstructor
//public enum AuthErrorCode {
//    // 회원가입 에러
//    EMAIL_INVALID("AUTH-001", "유효하지 않은 이메일 형식입니다"),
//    PASSWORD_VALIDATION_ERROR("AUTH-002", "비밀번호는 8~20자리수여야 합니다. 영문 대소문자, 숫자, 특수문자를 1개 이상 포함해야 합니다"),
//    NICKNAME_INVALID("AUTH-003", "닉네임은 2자 이상 10자 이하여야 합니다"),
//    GENDER_INVALID("AUTH-004", "성별은 여성 또는 남성이어야 합니다"),
//    BIRTH_INVALID("AUTH-005", "생년월일은 과거 날짜여야 합니다"),
//    PHONE_INVALID("AUTH-006", "올바른 전화번호 형식은 010-0000-0000입니다"),
//    DUPLICATE_EMAIL("AUTH-007", "이미 등록된 이메일입니다"),
//
//    // 로그인 에러
//    USER_NOT_FOUND("AUTH-101", "사용자를 찾을 수 없습니다"),
//    INVALID_PASSWORD("AUTH-102", "비밀번호가 일치하지 않습니다"),
//
//    // JWT 토큰 에러
//    TOKEN_NOT_FOUND("AUTH-201", "토큰이 존재하지 않습니다"),
//    INVALID_TOKEN_SIGNATURE("AUTH-202", "토큰 서명이 유효하지 않습니다"),
//    MALFORMED_TOKEN("AUTH-203", "잘못된 형식의 토큰입니다"),
//    EXPIRED_ACCESS_TOKEN("AUTH-204", "액세스 토큰이 만료되었습니다"),
//    EXPIRED_REFRESH_TOKEN("AUTH-205", "리프레시 토큰이 만료되었습니다");
//
//    private final String code;
//    private final String message;
//}