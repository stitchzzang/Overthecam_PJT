package com.overthecam.common.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;


@RestController("/api")
public class GlobalExceptionHandler {

    // 성공 응답을 처리하는 메소드
    protected <T> ResponseEntity<GlobalResponseDto<T>> success(T data, String message) {
        GlobalResponseDto<T> response = GlobalResponseDto.<T>builder()
                .success(true)
                .code("200")
                .message(message)
                .data(data)
                .build();

        return ResponseEntity.ok(response);
    }

    // 예외 처리하는 메소드
    @ExceptionHandler(value = GlobalException.class)
    public ResponseEntity<GlobalResponseDto<Object>> handleGlobalException(GlobalException e) {
        GlobalResponseDto<Object> response = GlobalResponseDto.builder()
                .success(false)
                .code(String.valueOf(e.getHttpStatusCode()))
                .message(e.getMessage())
                .build();

        return ResponseEntity
                .status(e.getHttpStatus())
                .body(response);
    }
}

