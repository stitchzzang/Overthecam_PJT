package com.overthecam.vote.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VoteErrorCode implements ErrorCode {
    // 투표 생성 관련 에러
    INVALID_VOTE_OPTIONS(400, "투표 옵션은 정확히 2개여야 합니다"),
    INVALID_END_DATE(400, "종료일은 현재 이후의 날짜여야 합니다"),

    // 투표 조회/수정/삭제 관련 에러
    VOTE_NOT_FOUND(404, "투표를 찾을 수 없습니다"),
    VOTE_EXPIRED(400, "종료된 투표입니다"),
    UNAUTHORIZED_VOTE_ACCESS(403, "투표 삭제 권한이 없습니다"),
    VOTE_OPTION_NOT_FOUND(404, "투표 옵션을 찾을 수 없습니다"),

    // 투표 참여 관련 에러
    DUPLICATE_VOTE(400, "이미 참여한 투표입니다"),
    VOTE_FAILED(500, "투표 처리 중 오류가 발생했습니다"),
    INVALID_VOTE_OPTION(400, "해당 투표의 옵션이 아닙니다"),

    // 투표 댓글 관련 에러
    COMMENT_NOT_FOUND(404, "댓글을 찾을 수 없습니다"),
    UNAUTHORIZED_COMMENT_ACCESS(403, "댓글 수정/삭제 권한이 없습니다");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}