package com.overthecam.websocket.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatMessageResponse {
    private String nickname;
    private String content;
    private LocalDateTime timestamp;
}
