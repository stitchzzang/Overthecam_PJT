package com.overthecam.exception.vote;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VoteErrorCode {
    // 투표 생성 관련 에러
    VOTE_CREATION_FAILED("VOTE-001", "투표 생성에 실패했습니다"),
    INVALID_VOTE_OPTIONS("VOTE-002", "투표 옵션은 최소 2개 이상이어야 합니다"),
    INVALID_END_DATE("VOTE-003", "종료일은 현재 이후의 날짜여야 합니다"),

    // 투표 조회/수정/삭제 관련 에러
    VOTE_NOT_FOUND("VOTE-004", "투표를 찾을 수 없습니다"),
    VOTE_EXPIRED("VOTE-005", "종료된 투표입니다"),
    UNAUTHORIZED_VOTE_ACCESS("VOTE-006", "투표 접근 권한이 없습니다"),
    VOTE_ALREADY_ENDED("VOTE-007", "이미 종료된 투표입니다"),
    VOTE_OPTION_NOT_FOUND("VOTE-008", "투표 옵션을 찾을 수 없습니다"),

    // 투표 참여 관련 에러
    DUPLICATE_VOTE("VOTE-009", "이미 투표했습니다"),
    INSUFFICIENT_SCORE("VOTE-010", "응원 점수가 부족합니다"),

    // 투표 댓글 관련 에러
    COMMENT_NOT_FOUND("VOTE-011", "댓글을 찾을 수 없습니다"),
    COMMENT_CREATION_FAILED("VOTE-012", "댓글 작성에 실패했습니다"),
    UNAUTHORIZED_COMMENT_ACCESS("VOTE-013", "댓글 수정/삭제 권한이 없습니다"),

    // 통계 관련 에러
    STATISTICS_CALCULATION_FAILED("VOTE-014", "투표 통계 계산에 실패했습니다");

    private final String code;
    private final String message;
}