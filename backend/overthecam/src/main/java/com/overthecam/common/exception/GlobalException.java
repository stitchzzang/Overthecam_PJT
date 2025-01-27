package com.overthecam.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class GlobalException extends RuntimeException {
    private final ErrorCode errorCode;
    @Getter
    private final String detail; //Client에는 전달되지 않고, 개발자들이 세부사항을 보기 위한 문자열.

    public GlobalException(ErrorCode errorCode, String detail) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.detail = detail;
    }

    public HttpStatus getHttpStatus() {
        return errorCode.getHttpStatus();
    }

}
