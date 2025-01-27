package com.overthecam.exception;

import com.overthecam.common.dto.CommonResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = GlobalException.class)
    public ResponseEntity<CommonResponseDto<Object>> handleGlobalException(GlobalException e) {
        log.error("Global Exception occurred: {} - {}", e.getErrorCode(), e.getDetail());

        return ResponseEntity
            .status(e.getErrorCode().getHttpStatus())
            .body(CommonResponseDto.error(e.getErrorCode()));
    }

    // 기본 예외 처리 추가
    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonResponseDto<Object>> handleException(Exception e) {
        log.error("Unexpected Exception occurred:", e);

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(CommonResponseDto.error(ErrorCode.INTERNAL_SERVER_ERROR));
    }

    // Resource Not Found 예외 처리 추가
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<CommonResponseDto<Object>> handleNoResourceFoundException(
        NoResourceFoundException e) {
        log.error("Resource not found:", e);

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(CommonResponseDto.error(ErrorCode.INVALID_INPUT_VALUE));
    }
}