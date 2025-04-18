package com.overthecam.websocket.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum WebSocketErrorCode implements ErrorCode {

    // 채팅방 에러
    BATTLE_NOT_FOUND(404, "배틀을 찾을 수 없습니다"),
    UNAUTHORIZED_CHAT_ACCESS(403, "채팅방 접근 권한이 없습니다"),
    BATTLE_ROOM_INACTIVE(400, "이미 종료된 배틀방입니다."),

    // WebSocket JWT 토큰 에러
    TOKEN_NOT_FOUND(401, "토큰이 존재하지 않습니다"),
    INVALID_TOKEN_SIGNATURE(401, "토큰 서명이 유효하지 않습니다"),
    MALFORMED_TOKEN(401, "잘못된 형식의 토큰입니다"),
    EXPIRED_ACCESS_TOKEN(401, "액세스 토큰이 만료되었습니다. 토큰을 갱신해주세요."),
    EXPIRED_REFRESH_TOKEN(401, "리프레시 토큰이 만료되었습니다. 재로그인이 필요합니다."),

    UNAUTHORIZED_USER_ACCESS(400, "올바르지 않은 사용자 정보입니다"),
    INVALID_MESSAGE_FORMAT(400, "올바르지 않은 메시지 타입입니다."),

    // 배틀 배팅 관련 에러
    INVALID_VOTE_RESULT(500, "투표 결과를 처리할 수 없습니다"),
    INVALID_BATTLE_STATUS(400, "현재 투표 가능한 상태가 아닙니다"),
    INVALID_BATTLER_VOTE(400, "배틀러는 투표를 할 수 없습니다"),
    INVALID_ROLE(400, "올바른 배틀 역할이 아닙니다."),
    BATTLER_VOTE_NOT_FOUND(404, "배틀러가 선택한 투표 옵션이 존재하지 않습니다"),
    NOT_PREPARED(400, "배틀 준비가 필요합니다"),

    // 사용자 응원 및 포인트 에러
    INSUFFICIENT_SCORE(400, "응원점수가 부족합니다"),
    INSUFFICIENT_POINT(400, "포인트가 부족합니다"),

    INTERNAL_SERVER_ERROR(500, "서버 내부 오류가 발생했습니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}
