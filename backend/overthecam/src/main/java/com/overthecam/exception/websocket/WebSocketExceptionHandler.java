package com.overthecam.exception.websocket;

import com.overthecam.websocket.dto.WebSocketResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class WebSocketExceptionHandler {

    @MessageExceptionHandler(WebSocketException.class)
    @SendToUser(destinations = "/queue/notifications", broadcast = false)
    public WebSocketResponseDto<?> handleWebSocketException(WebSocketException ex) {
        log.error("WebSocket 통신 오류: {}", ex.getMessage());
        return WebSocketResponseDto.error(ex.getErrorCode());
    }

}