package com.overthecam.websocket.dto;

import com.overthecam.websocket.exception.WebSocketErrorCode;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WebSocketResponseDto<T> {
    private MessageType type;
    private String code;
    private String message;
    private T data;

    // 일반적인 성공 응답
    public static <T> WebSocketResponseDto<T> ok(MessageType type, T data) {
        return WebSocketResponseDto.<T>builder()
                .type(type)
                .code("WS-200")
                .message("성공적으로 처리되었습니다")
                .data(data)
                .build();
    }

    // 연결 성공
    public static WebSocketResponseDto<Void> connectSuccess() {
        return WebSocketResponseDto.<Void>builder()
                .type(MessageType.CONNECT)
                .code("WS-200")
                .message("WebSocket 연결이 성공적으로 수립되었습니다")
                .build();
    }

    // 구독 성공
    public static WebSocketResponseDto<Void> subscribeSuccess(String destination) {
        return WebSocketResponseDto.<Void>builder()
                .type(MessageType.SUBSCRIBE)
                .code("WS-200")
                .message(destination + " 구독이 성공적으로 완료되었습니다")
                .build();
    }

    // 메시지 전송 성공
    public static <T> WebSocketResponseDto<T> messageSendSuccess(MessageType type, T data) {
        return WebSocketResponseDto.<T>builder()
                .type(type)
                .code("WS-200")
                .message("메시지가 성공적으로 전송되었습니다")
                .data(data)
                .build();
    }

    // 에러 응답
    public static <T> WebSocketResponseDto<T> error(WebSocketErrorCode errorCode) {
        return WebSocketResponseDto.<T>builder()
                .type(MessageType.ERROR)
                .code(errorCode.name())
                .message(errorCode.getMessage())
                .build();
    }
}