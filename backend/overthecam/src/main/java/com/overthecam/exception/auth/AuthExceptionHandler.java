//package com.overthecam.exception.auth;
//
//import com.overthecam.common.dto.CommonResponseDto;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//@Slf4j
//@RestControllerAdvice("com.overthecam.auth")  // auth 패키지에만 적용
//public class AuthExceptionHandler {
//    @ExceptionHandler(AuthException.class)
//    public ResponseEntity<AuthResponseDto<?>> handleAuthException(AuthException ex) {
//        log.error("Auth Exception occurred: {} - {}", ex.getErrorCode(), ex.getDetail());
//        return ResponseEntity
//                .status(HttpStatus.UNAUTHORIZED)
//                .body(AuthResponseDto.error(ex.getErrorCode()));
//    }
//}