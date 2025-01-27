package com.overthecam.common;

import org.springframework.http.HttpStatus;

/**
 * 에러 코드를 정의하는 인터페이스입니다.
 * 모든 에러 코드 열거형은 이 인터페이스를 구현해야 합니다.
 */
public interface ErrorCode {
    boolean isSuccess();
    int getStatusCode();
    String getCode();
    String getMessage();
}
