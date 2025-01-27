package com.overthecam.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class GlobalException extends Exception {

    private final HttpStatus httpStatus;

    public GlobalException(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
    }

    public int getHttpStatusCode() {
        return httpStatus.value();
    } //400과 같은 에러 코드를 리턴시킨다.

}
