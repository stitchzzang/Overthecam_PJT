package com.overthecam.member.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FollowErrorCode implements ErrorCode {

    SELF_FOLLOW_NOT_ALLOWED(400, "자기 자신을 팔로우할 수 없습니다"),
    ALREADY_FOLLOWING(409, "이미 팔로우한 사용자입니다"),
    FOLLOW_NOT_FOUND(404, "팔로우 관계가 존재하지 않습니다");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}


