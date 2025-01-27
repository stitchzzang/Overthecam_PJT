package com.overthecam.common.exception;

import com.overthecam.common.Constants;
import org.springframework.http.HttpStatus;

public class GlobalException extends Exception {

    private Constants.ExceptionClass exceptionClass;
    private HttpStatus httpStatus;

    public GlobalException(Constants.ExceptionClass exceptionClass, HttpStatus httpStatus, String message) {
        super(exceptionClass.toString() + message); //constants의 toString 결과값에 detail message를 더한다.
        this.exceptionClass = exceptionClass;
        this.httpStatus = httpStatus;
    }

    public int getHttpStatusCode() {
        return httpStatus.value();
    } //400과 같은 에러 코드를 리턴시킨다.

    public String getHttpStatusType() {
        return httpStatus.getReasonPhrase();
    }

    public HttpStatus getHttpStatus() {
        return httpStatus; //객체 자체를 리턴시킨다.
    }

}
