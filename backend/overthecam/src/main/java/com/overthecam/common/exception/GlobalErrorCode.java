package com.overthecam.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum GlobalErrorCode implements ErrorCode {

    // 공통 에러
    INVALID_INPUT_VALUE(400, "잘못된 입력값입니다"),
    INTERNAL_SERVER_ERROR(500, "서버 오류가 발생했습니다"),
    RESOURCE_NOT_FOUND(404, "요청한 리소스를 찾을 수 없습니다"),
    METHOD_NOT_ALLOWED(405, "지원하지 않는 HTTP 메소드입니다"),
    CONCURRENT_UPDATE(500, "다른 트랜잭션에 의해 데이터가 변경되었습니다");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}
