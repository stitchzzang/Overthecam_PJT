package com.overthecam.chat.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatMessageResponse {
    private Long chatRoomId;
    private String username;
    private String content;
    private LocalDateTime timestamp;
}
