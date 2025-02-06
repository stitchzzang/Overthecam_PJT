package com.overthecam.chat.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatMessageResponse {
    private Long battleId;
    private String nickname;
    private String content;
    private LocalDateTime timestamp;
}
