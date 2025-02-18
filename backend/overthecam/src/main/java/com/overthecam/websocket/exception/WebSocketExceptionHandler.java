package com.overthecam.websocket.exception;

import com.overthecam.common.dto.ErrorResponse;
import com.overthecam.common.exception.GlobalException;
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
        log.error("WebSocket Exception occurred: {} - {}", e.getMessage());


        if (e instanceof WebSocketException) {
            WebSocketException wsException = (WebSocketException) e;
            ErrorResponse errorResponse = ErrorResponse.of(wsException.getErrorCode());
            return WebSocketResponseDto.error(MessageType.ERROR, errorResponse);
        }

        if (e instanceof GlobalException) {
            GlobalException globalException = (GlobalException) e;
            ErrorResponse errorResponse = ErrorResponse.of(globalException.getErrorCode());
            return WebSocketResponseDto.error(MessageType.ERROR, errorResponse);
        }

        // 기타 예외는 INTERNAL_SERVER_ERROR로 처리
        ErrorResponse errorResponse = ErrorResponse.of(WebSocketErrorCode.INTERNAL_SERVER_ERROR, e.getMessage());
        return WebSocketResponseDto.error(MessageType.ERROR, errorResponse);
    }
}