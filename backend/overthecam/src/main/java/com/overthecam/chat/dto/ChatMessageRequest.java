package com.overthecam.chat.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatMessageRequest {
    private Long chatRoomId;
    private String username;
    private String content;
    private LocalDateTime timestamp;
}
