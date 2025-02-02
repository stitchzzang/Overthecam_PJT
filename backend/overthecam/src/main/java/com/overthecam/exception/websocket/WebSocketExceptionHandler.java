package com.overthecam.exception.websocket;

import com.overthecam.websocket.dto.WebSocketResponseDto;
import java.security.Principal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class WebSocketExceptionHandler {

//    @MessageExceptionHandler(WebSocketException.class)
//    @SendToUser("/queue/errors")
//    public WebSocketResponseDto<?> handleStompException(WebSocketException ex) {
//        log.error("WebSocket 통신 오류: {}", ex.getMessage());
//        return WebSocketResponseDto.error(ex.getErrorCode());
//    }

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketExceptionHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageExceptionHandler(WebSocketException.class)
    public void handleWebSocketException(WebSocketException ex, Principal principal) {
        log.error("WebSocket 통신 오류: {}", ex.getMessage());

        if (principal != null) {
            WebSocketResponseDto<?> errorResponse = WebSocketResponseDto.error(ex.getErrorCode());
            messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",  // 클라이언트는 /user/queue/errors를 구독해야 함
                errorResponse
            );
        }
    }
}
