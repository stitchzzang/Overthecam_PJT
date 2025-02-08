package com.overthecam.websocket.exception;

import lombok.Getter;

@Getter
public class WebSocketException extends RuntimeException {
    private final WebSocketErrorCode errorCode;

    public WebSocketException(WebSocketErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
