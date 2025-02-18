package com.overthecam.websocket.dto;

import com.overthecam.common.dto.ErrorResponse;
import com.overthecam.websocket.exception.WebSocketErrorCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketResponseDto<T> {
    private boolean success;
    private MessageType type;
    private T data;
    private ErrorResponse error;

    // 성공 응답
    public static <T> WebSocketResponseDto<T> ok(MessageType type, T data) {
        return WebSocketResponseDto.<T>builder()
                .success(true)
                .type(type)
                .data(data)
                .build();
    }

    // 에러 응답
    public static <T> WebSocketResponseDto<T> error(MessageType type, ErrorResponse error) {
        return WebSocketResponseDto.<T>builder()
                .success(false)
                .type(type)
                .error(error)
                .build();
    }
}