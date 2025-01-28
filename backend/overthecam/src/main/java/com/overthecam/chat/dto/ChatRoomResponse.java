package com.overthecam.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatRoomResponse {
    private Long chatRoomId;
    private Long battleId;
}
