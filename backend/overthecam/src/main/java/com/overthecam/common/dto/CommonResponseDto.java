package com.overthecam.common.dto;

import com.overthecam.exception.ErrorCode;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommonResponseDto<T> {
    private int code;
    private String message;
    private T data;

    // 성공 응답을 위한 정적 팩토리 메서드
    public static <T> CommonResponseDto<T> success(T data) {
        return CommonResponseDto.<T>builder()
            .code(200)
            .message("요청이 성공적으로 처리되었습니다")
            .data(data)
            .build();
    }

    // 성공 응답 (메시지 지정)
    public static <T> CommonResponseDto<T> success(String message, T data) {
        return CommonResponseDto.<T>builder()
            .code(200)
            .message(message)
            .data(data)
            .build();
    }

    // 에러 응답을 위한 정적 팩토리 메서드
    public static <T> CommonResponseDto<T> error(ErrorCode errorCode) {
        return CommonResponseDto.<T>builder()
            .code(errorCode.getHttpStatus().value())
            .message(errorCode.getMessage())
            .build();
    }
}