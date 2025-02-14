package com.overthecam.redis.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RedisErrorCode implements ErrorCode {
    TRANSACTION_FAILED(500, "Redis 트랜잭션이 실패했습니다."),
    LOCK_ACQUISITION_FAILED(500, "Redis 락 획득에 실패했습니다."),
    CACHE_OPERATION_FAILED(500, "Redis 캐시 작업이 실패했습니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}