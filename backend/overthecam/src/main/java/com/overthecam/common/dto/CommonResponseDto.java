package com.overthecam.common.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommonResponseDto<T> {
    private boolean success;
    private T data;
    private ErrorResponse error;

    // 성공 응답을 위한 정적 팩토리 메서드
    public static <T> CommonResponseDto<T> ok(T data) {
        return CommonResponseDto.<T>builder()
            .success(true)
            .data(data)
            .build();
    }

    public static <T> CommonResponseDto<T> ok() {
        return CommonResponseDto.<T>builder()
            .success(true)
            .build();
    }

    // 에러 응답
    public static <T> CommonResponseDto<T> error(ErrorResponse error) {
        return CommonResponseDto.<T>builder()
            .success(false)
            .error(error)
            .build();
    }

}