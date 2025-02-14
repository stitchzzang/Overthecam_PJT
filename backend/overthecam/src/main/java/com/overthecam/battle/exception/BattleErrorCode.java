package com.overthecam.battle.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BattleErrorCode implements ErrorCode {
    // Battle 기본 에러
    BATTLE_NOT_FOUND(404, "배틀이 존재하지 않습니다"),
    BATTLE_ALREADY_STARTED(400, "이미 시작된 배틀입니다"),
    INVALID_PARTICIPANT_COUNT(400, "참가자 수가 올바르지 않습니다"),

    // Battle 제목/주제 관련 에러
    TOPIC_GENERATION_FAILED(500, "주제 생성에 실패했습니다"),
    BATTLE_TITLE_UPDATE_FAILED(500, "방제 변경에 실패했습니다"),
    BATTLE_ROOM_READ_FAILED(404, "만들어진 배틀방이 없습니다"),

    // OpenVidu 관련 에러
    OPENVIDU_CONNECTION_ERROR(500, "OpenVidu 서버 연동 중 오류가 발생했습니다"),
    OPENVIDU_SESSION_ERROR(500, "OpenVidu 세션 생성에 실패했습니다"),
    MISSING_REQUIRED_FIELD(400, "필수 입력값이 누락되었습니다."),

    // 배틀 배팅 관련 에러
    INVALID_VOTE_RESULT(500, "투표 결과를 처리할 수 없습니다"),
    INVALID_BATTLE_STATUS(400, "현재 투표 가능한 상태가 아닙니다"),
    INVALID_BATTLER_VOTE(400, "배틀러는 투표를 할 수 없습니다"),
    INVALID_ROLE(400, "올바른 배틀 역할이 아닙니다."),
    BATTLER_VOTE_NOT_FOUND(404, "배틀러가 선택한 투표 옵션이 존재하지 않습니다"),
    NOT_PREPARED(400, "배틀 준비가 필요합니다"),
    INVALID_BATTLE_START(400, "모든 참가자가 준비되지 않았습니다.");


    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}