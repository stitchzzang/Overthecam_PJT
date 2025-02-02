package com.overthecam.chat.service;

import com.overthecam.chat.domain.ChatRoom;
import com.overthecam.chat.dto.ChatMessageRequest;
import com.overthecam.chat.dto.ChatMessageResponse;
import com.overthecam.chat.repository.ChatRoomRepository;
import com.overthecam.exception.websocket.WebSocketErrorCode;
import com.overthecam.exception.websocket.WebSocketException;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatRoomRepository chatRoomRepository;

    public ChatMessageResponse sendMessage(ChatMessageRequest request, Long chatRoomId) {
        validateChatRoom(request.getBattleId(), chatRoomId);

        return ChatMessageResponse.builder()
            .battleId(request.getBattleId())
            .chatRoomId(chatRoomId)
            .username(request.getUsername())
            .content(request.getContent())
            .timestamp(LocalDateTime.now())
            .build();
    }

    private void validateChatRoom(Long battleId, Long chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new WebSocketException(
                WebSocketErrorCode.CHAT_ROOM_NOT_FOUND,
                "채팅방 ID: " + chatRoomId
            ));

        // 배틀 존재 여부 확인
        if (chatRoom.getBattle() == null) {
            throw new WebSocketException(
                WebSocketErrorCode.BATTLE_NOT_FOUND,
                "채팅방 ID: " + chatRoomId + "에 연결된 배틀이 없습니다"
            );
        }

        // 배틀 ID 일치 여부 확인
        if (!battleId.equals(chatRoom.getBattle().getId())) {
            throw new WebSocketException(
                WebSocketErrorCode.UNAUTHORIZED_CHAT_ACCESS,
                "요청된 배틀 ID: " + battleId + ", 실제 배틀 ID: " + chatRoom.getBattle().getId()
            );
        }

        // 채팅방 활성화 상태 확인
        if (!chatRoom.isActive()) {
            throw new WebSocketException(
                WebSocketErrorCode.CHAT_ROOM_INACTIVE,
                "채팅방 ID: " + chatRoomId + "는 현재 비활성화 상태입니다"
            );
        }
    }


}
