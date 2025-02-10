package com.overthecam.member.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {


    INSUFFICIENT_SCORE(400, "응원점수가 부족합니다"),
    INSUFFICIENT_POINTS(400, "포인트가 부족합니다");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}
