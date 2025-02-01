package com.overthecam.exception;

import com.overthecam.common.dto.CommonResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Global 예외 처리
    @ExceptionHandler(value = GlobalException.class)
    public ResponseEntity<CommonResponseDto<Object>> handleGlobalException(GlobalException e) {
        log.error("Global Exception occurred: {} - {}", e.getErrorCode(), e.getDetail());

        return ResponseEntity
            .status(e.getErrorCode().getHttpStatus())
            .body(CommonResponseDto.error(e.getErrorCode()));
    }

    // 입력값 검증 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Object>> handleValidationExceptions(
            MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        ErrorCode errorCode = fieldError != null && fieldError.getField().equals("password")
                ? ErrorCode.PASSWORD_VALIDATION_ERROR
                : ErrorCode.INVALID_INPUT_VALUE;

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(CommonResponseDto.error(errorCode));
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

    // 지원하지 않는 http 메서드를 요청한 경우
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)  // 405 상태 코드
    public CommonResponseDto<?> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return CommonResponseDto.error(ErrorCode.METHOD_NOT_ALLOWED);
    }
}