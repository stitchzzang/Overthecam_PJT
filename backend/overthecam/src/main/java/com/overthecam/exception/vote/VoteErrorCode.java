package com.overthecam.exception.vote;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VoteErrorCode {
    // 투표 생성 관련 에러
    INVALID_VOTE_OPTIONS("VOTE-001", "투표 옵션은 정확히 2개여야 합니다"),
    INVALID_END_DATE("VOTE-002", "종료일은 현재 이후의 날짜여야 합니다"),

    // 투표 조회/수정/삭제 관련 에러
    VOTE_NOT_FOUND("VOTE-003", "투표를 찾을 수 없습니다"),
    VOTE_EXPIRED("VOTE-004", "종료된 투표입니다"),
    UNAUTHORIZED_VOTE_ACCESS("VOTE-005", "투표 삭제 권한이 없습니다"),
    VOTE_OPTION_NOT_FOUND("VOTE-006", "투표 옵션을 찾을 수 없습니다"),

    // 투표 참여 관련 에러
    DUPLICATE_VOTE("VOTE-007", "이미 투표했습니다"),
    INSUFFICIENT_SCORE("VOTE-008", "응원 점수가 부족합니다"),

    // 투표 댓글 관련 에러
    COMMENT_NOT_FOUND("VOTE-009", "댓글을 찾을 수 없습니다"),
    UNAUTHORIZED_COMMENT_ACCESS("VOTE-010", "댓글 수정/삭제 권한이 없습니다");

    private final String code;
    private final String message;
}