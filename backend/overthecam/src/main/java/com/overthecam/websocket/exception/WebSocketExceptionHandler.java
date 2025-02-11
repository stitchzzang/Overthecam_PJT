package com.overthecam.websocket.exception;

import com.overthecam.common.dto.ErrorResponse;
import com.overthecam.websocket.dto.MessageType;
import com.overthecam.websocket.dto.WebSocketResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class WebSocketExceptionHandler {

    @MessageExceptionHandler({WebSocketException.class, Exception.class})  // 모든 예외 처리
    @SendToUser(destinations = "/queue/battle/{battleId}", broadcast = false)
    public WebSocketResponseDto<?> handleWebSocketException(Exception e) {
        log.error("WebSocket 통신 오류:", e);

        if (e instanceof WebSocketException) {
            WebSocketException wsException = (WebSocketException) e;
            ErrorResponse errorResponse = ErrorResponse.of(wsException.getErrorCode());
            return WebSocketResponseDto.error(MessageType.ERROR, errorResponse);
        }

        // Redis 등 다른 예외들도 WebSocket 응답으로 변환
        ErrorResponse errorResponse = ErrorResponse.of(WebSocketErrorCode.INTERNAL_SERVER_ERROR, e.getMessage());
        return WebSocketResponseDto.error(MessageType.ERROR, errorResponse);
    }
}