package com.overthecam.chat.controller;

import com.overthecam.battle.domain.Battle;
import com.overthecam.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @GetMapping("/rooms/{battleId}")
    public ResponseEntity<?> createChatRoom(@PathVariable Long battleId){
        Battle battle = Battle.builder()
            .id(battleId)
            .build();
        chatRoomService.createChatRoom(battle);
        return ResponseEntity.ok().body(chatRoomService.getChatRoomId(battleId));
    }
}
