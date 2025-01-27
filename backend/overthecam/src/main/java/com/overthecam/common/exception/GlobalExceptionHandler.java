package com.overthecam.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice("/api")
public class GlobalExceptionHandler {

    // 예외 처리하는 메소드
    @ExceptionHandler(value = GlobalException.class)
    public ResponseEntity<GlobalResponseDto<Object>> handleGlobalException(GlobalException e) {
        // 로그에 상세 정보 남기기
        log.error("Error occurred: {} - {}", e.getMessage(), e.getDetail());

        return createErrorResponse(e);
    }

    private ResponseEntity<GlobalResponseDto<Object>> createErrorResponse(GlobalException e) {
        GlobalResponseDto<Object> response = GlobalResponseDto.builder()
                .code(String.valueOf(e.getHttpStatus().value()))
                .message(e.getMessage())
                .build();

        return ResponseEntity
                .status(e.getHttpStatus())
                .body(response);
    }


}

