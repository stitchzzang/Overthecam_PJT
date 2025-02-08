package com.overthecam.common.exception;


import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Global 예외 처리
    @ExceptionHandler(GlobalException.class)
    public ResponseEntity<CommonResponseDto<Object>> handleGlobalException(GlobalException e) {
        log.error("Global Exception occurred: {} - {}", e.getErrorCode(), e.getDetail());

        ErrorResponse errorResponse = ErrorResponse.of(e.getErrorCode(), e.getDetail());
        return ResponseEntity
            .status(e.getErrorCode().getStatus())
            .body(CommonResponseDto.error(errorResponse));
    }

    // 입력값 검증 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Object>> handleValidationExceptions(
        MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        String errorMessage = fieldError != null
            ? fieldError.getDefaultMessage()
            : GlobalErrorCode.INVALID_INPUT_VALUE.getMessage();

        ErrorResponse errorResponse = ErrorResponse.of(GlobalErrorCode.INVALID_INPUT_VALUE, errorMessage);
        return ResponseEntity
            .status(GlobalErrorCode.INVALID_INPUT_VALUE.getStatus())
            .body(CommonResponseDto.error(errorResponse));
    }

    // 기본 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonResponseDto<Object>> handleException(Exception e) {
        log.error("Unexpected Exception occurred:", e);

        ErrorResponse errorResponse = ErrorResponse.of(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        return ResponseEntity
            .status(GlobalErrorCode.INTERNAL_SERVER_ERROR.getStatus())
            .body(CommonResponseDto.error(errorResponse));
    }

    // Resource Not Found 예외 처리
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<CommonResponseDto<Object>> handleNoResourceFoundException(
        NoResourceFoundException e) {
        log.error("Resource not found:", e);

        ErrorResponse errorResponse = ErrorResponse.of(GlobalErrorCode.RESOURCE_NOT_FOUND);
        return ResponseEntity
            .status(GlobalErrorCode.RESOURCE_NOT_FOUND.getStatus())
            .body(CommonResponseDto.error(errorResponse));
    }

    // 지원하지 않는 HTTP 메서드 요청 처리
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<CommonResponseDto<Object>> handleMethodNotAllowed(
        HttpRequestMethodNotSupportedException e) {
        log.error("Method not allowed:", e);

        ErrorResponse errorResponse = ErrorResponse.of(GlobalErrorCode.METHOD_NOT_ALLOWED);
        return ResponseEntity
            .status(GlobalErrorCode.METHOD_NOT_ALLOWED.getStatus())
            .body(CommonResponseDto.error(errorResponse));
    }
}