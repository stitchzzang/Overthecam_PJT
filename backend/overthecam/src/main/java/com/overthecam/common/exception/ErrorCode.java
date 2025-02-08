package com.overthecam.common.exception;


public interface ErrorCode {

    int getStatus();
    String code();
    String getMessage();
}