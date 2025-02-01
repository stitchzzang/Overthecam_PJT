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
    CHAT_ROOM_INACTIVE(HttpStatus.BAD_REQUEST, "비활성화된 채팅방입니다"),


    // OpenVidu 관련 에러
    OPENVIDU_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "OpenVidu 서버 연동 중 오류가 발생했습니다."),

    // Battle 관련 에러
    BATTLE_ALREADY_STARTED(HttpStatus.BAD_REQUEST, "이미 시작된 배틀입니다."),
    //BATTLE_NOT_FOUND(HttpStatus.NOT_FOUND, "배틀이 존재하지 않습니다"),
    INVALID_PARTICIPANT_COUNT(HttpStatus.BAD_REQUEST, "참가자 수가 올바르지 않습니다."),

    // 방제 변경 관련 에러
    TOPIC_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "주제 생성에 실패했습니다"),
    BATTLE_TITLE_UPDATE_FAILED(HttpStatus.BAD_REQUEST, "방제 변경에 실패했습니다");


    private final HttpStatus httpStatus;
    private final String message;
}
