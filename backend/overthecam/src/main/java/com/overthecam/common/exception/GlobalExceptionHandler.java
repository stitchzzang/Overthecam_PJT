package com.overthecam.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice("/api")
public class GlobalExceptionHandler {

    // 성공 응답을 처리하는 메소드
    protected <T> ResponseEntity<GlobalResponseDto<T>> success(T data, String message) {
        GlobalResponseDto<T> response = GlobalResponseDto.<T>builder()
                .code(String.valueOf(HttpStatus.OK.value()))  // "200"
                .message(message)
                .data(data)
                .build();

        return ResponseEntity.ok(response);
    }

    // 예외 처리하는 메소드
    @ExceptionHandler(value = GlobalException.class)
    public ResponseEntity<GlobalResponseDto<Object>> handleGlobalException(GlobalException e) {

        // 로그에 상세 정보 남기기
        log.error("Error occurred: {} - {}", e.getMessage(), e.getDetail());


        GlobalResponseDto<Object> response = GlobalResponseDto.builder()
                .code(String.valueOf(e.getHttpStatus().value()))  // HTTP 상태 코드를 문자열로 변환 (e.g., "404")
                .message(e.getMessage()) //client에게는 미리 정의된 메시지만 보여주자.
                //.detail(e.getDetail())
                .build();

        return ResponseEntity
                .status(e.getHttpStatus())
                .body(response);
    }
}

