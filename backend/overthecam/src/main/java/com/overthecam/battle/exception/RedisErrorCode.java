package com.overthecam.battle.exception;


import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RedisErrorCode implements ErrorCode {

    TRANSACTION_FAILED(500, "트랜잭션이 실패했습니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}
