package com.overthecam.chat.service;

import com.overthecam.chat.dto.ChatMessageRequest;
import com.overthecam.chat.dto.ChatMessageResponse;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    public ChatMessageResponse sendMessage(ChatMessageRequest request, Long chatRoomId) {
        validateChatRoom(request.getChatRoomId(), chatRoomId);

        return ChatMessageResponse.builder()
            .chatRoomId(chatRoomId)
            .username(request.getUsername())
            .content(request.getContent())
            .timestamp(LocalDateTime.now())
            .build();
    }

    private void validateChatRoom(Long requestRoomId, Long pathRoomId) {
        if (!pathRoomId.equals(requestRoomId)) {
            throw new IllegalArgumentException("Chat room ID mismatch");
        }
        // 추가적인 검증 로직 구현 -> ex)채팅방 존재 여부, 사용자 권한 등
    }
}
