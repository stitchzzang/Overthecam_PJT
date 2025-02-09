package com.overthecam.websocket.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatMessageRequest {
    private String content;
    private LocalDateTime timestamp;
}
