package com.overthecam.chat.service;

import com.overthecam.chat.domain.ChatRoom;
import com.overthecam.chat.dto.ChatMessageRequest;
import com.overthecam.chat.dto.ChatMessageResponse;
import com.overthecam.chat.repository.ChatRoomRepository;
import com.overthecam.exception.websocket.WebSocketErrorCode;
import com.overthecam.exception.websocket.WebSocketException;
import com.overthecam.websocket.dto.UserPrincipal;
import com.overthecam.websocket.dto.WebSocketResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatRoomRepository chatRoomRepository;

    public WebSocketResponseDto<?> sendMessage(ChatMessageRequest request, Long chatRoomId,
                                               UserPrincipal user) {
        validateChatRoom(request.getBattleId(), chatRoomId);

        return WebSocketResponseDto.messageSendSuccess(
                ChatMessageResponse.builder()
                        .battleId(request.getBattleId())
                        .chatRoomId(chatRoomId)
                        .nickname(user.getNickname())  // UserPrincipal에서 직접 가져오기
                        .content(request.getContent())
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    private void validateChatRoom(Long battleId, Long chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new WebSocketException(
                        WebSocketErrorCode.CHAT_ROOM_NOT_FOUND,
                        String.format("존재하지 않는 채팅방입니다. (요청된 채팅방 ID: %d)", chatRoomId)
                ));

        // 배틀 존재 여부 확인
        if (chatRoom.getBattle() == null) {
            throw new WebSocketException(
                    WebSocketErrorCode.BATTLE_NOT_FOUND,
                    String.format("채팅방에 연결된 배틀 정보가 없습니다. (채팅방 ID: %d)", chatRoomId)
            );
        }

        // 배틀 ID 일치 여부 확인
        if (!battleId.equals(chatRoom.getBattle().getId())) {
            throw new WebSocketException(
                    WebSocketErrorCode.UNAUTHORIZED_CHAT_ACCESS,
                    String.format("잘못된 배틀 접근입니다. (요청한 배틀 ID: %d, 채팅방의 실제 배틀 ID: %d)",
                            battleId, chatRoom.getBattle().getId())
            );
        }

        // 채팅방 활성화 상태 확인
        if (!chatRoom.isActive()) {
            throw new WebSocketException(
                    WebSocketErrorCode.CHAT_ROOM_INACTIVE,
                    String.format("종료된 채팅방입니다. (채팅방 ID: %d)", chatRoomId)
            );
        }
    }


}
