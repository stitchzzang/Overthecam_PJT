package com.overthecam.chat.service;

import com.overthecam.battle.domain.Battle;
import com.overthecam.chat.domain.ChatRoom;
import com.overthecam.chat.dto.ChatRoomResponse;
import com.overthecam.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public ChatRoomResponse getChatRoomId(Long battleId) {
        ChatRoom chatRoom = chatRoomRepository.findByBattleId(battleId)
            .orElseThrow(() -> new RuntimeException("Chat room not found for battle ID: " + battleId));

        return ChatRoomResponse.builder()
            .chatRoomId(chatRoom.getId())
            .battleId(chatRoom.getBattle().getId())
            .build();
    }

    public void createChatRoom(Battle battle){
        ChatRoom chatRoom = ChatRoom.builder()
            .battle(battle)
            .build();

        chatRoomRepository.save(chatRoom);
        log.info(chatRoom.toString());
    }
}
