//package com.overthecam.exception.auth;
//
//import lombok.Getter;
//
//@Getter
//public class AuthException extends RuntimeException {
//    private final AuthErrorCode errorCode;
//    private final String detail;
//
//    public AuthException(AuthErrorCode errorCode, String detail) {
//        super(errorCode.getMessage());
//        this.errorCode = errorCode;
//        this.detail = detail;
//    }
//}