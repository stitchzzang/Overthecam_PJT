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
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 HTTP 메소드입니다"),

    // 회원가입 에러
    EMAIL_INVALID(HttpStatus.BAD_REQUEST, "유효하지 않은 이메일 형식입니다"),
    PASSWORD_VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "비밀번호는 8~20자리수여야 합니다. 영문 대소문자, 숫자, 특수문자를 1개 이상 포함해야 합니다"),
    NICKNAME_INVALID(HttpStatus.BAD_REQUEST, "닉네임은 2자 이상 10자 이하여야 합니다"),
    GENDER_INVALID(HttpStatus.BAD_REQUEST, "성별은 여성 또는 남성이어야 합니다"),
    BIRTH_INVALID(HttpStatus.BAD_REQUEST, "생년월일은 과거 날짜여야 합니다"),
    PHONE_INVALID(HttpStatus.BAD_REQUEST, "올바른 전화번호 형식은 010-0000-0000입니다"),

    // JWT 토큰 에러
    TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "토큰이 존재하지 않습니다"),
    INVALID_TOKEN_SIGNATURE(HttpStatus.UNAUTHORIZED, "토큰 서명이 유효하지 않습니다"),
    MALFORMED_TOKEN(HttpStatus.UNAUTHORIZED, "잘못된 형식의 토큰입니다"),
    EXPIRED_ACCESS_TOKEN(HttpStatus.UNAUTHORIZED, "액세스 토큰이 만료되었습니다"),
    EXPIRED_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "리프레시 토큰이 만료되었습니다"),

    // 로그인 에러
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 등록된 이메일입니다"),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다"),

    // 팔로우 관련 에러
    SELF_FOLLOW_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "자기 자신을 팔로우할 수 없습니다"),
    ALREADY_FOLLOWING(HttpStatus.CONFLICT, "이미 팔로우한 사용자입니다"),
    FOLLOW_NOT_FOUND(HttpStatus.NOT_FOUND, "팔로우 관계가 존재하지 않습니다"),


    // OpenVidu 관련 에러
    OPENVIDU_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "OpenVidu 서버 연동 중 오류가 발생했습니다."),

    // Battle 관련 에러
    BATTLE_ALREADY_STARTED(HttpStatus.BAD_REQUEST, "이미 시작된 배틀입니다."),
    BATTLE_NOT_FOUND(HttpStatus.NOT_FOUND, "배틀이 존재하지 않습니다"),
    INVALID_PARTICIPANT_COUNT(HttpStatus.BAD_REQUEST, "참가자 수가 올바르지 않습니다."),

    // 방제 변경 관련 에러
    TOPIC_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "주제 생성에 실패했습니다"),
    BATTLE_TITLE_UPDATE_FAILED(HttpStatus.BAD_REQUEST, "방제 변경에 실패했습니다");


    private final HttpStatus httpStatus;
    private final String message;
}
