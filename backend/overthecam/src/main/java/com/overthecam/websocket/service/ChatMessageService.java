package com.overthecam.websocket.service;

import com.overthecam.badwordfilter.service.BadWordFilterService;
import com.overthecam.badwordfilter.service.BadWordTrieService;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.websocket.dto.*;
import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final BattleRepository battleRepository;

    private final BadWordFilterService badWordFilterService;
    private final BadWordTrieService badWordTrieService;

    public ChatMessageResponse sendSystemMessage(String content){
        return ChatMessageResponse.builder()
            .nickname("System")
            .content(content)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ChatMessageResponse sendMessage(ChatMessageRequest message, UserPrincipal user) {

        String content = badWordFilterService.filterForEdit(message.getContent(), badWordTrieService.getTrie());

        return ChatMessageResponse.builder()
                .nickname(user.getNickname())
                .content(content)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private void validateChatRoom(Long battleId) {

        // 배틀 존재 여부 확인
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new WebSocketException(
                        WebSocketErrorCode.BATTLE_NOT_FOUND,
                        String.format("존재하지 않는 배틀방입니다. (요청된 배틀방 ID: %d)", battleId)
                ));

        // 배틀 활성화 상태 확인
        if (battle.getStatus() == Status.END) {
            throw new WebSocketException(
                    WebSocketErrorCode.BATTLE_ROOM_INACTIVE,
                    String.format("종료된 배틀방입니다. (배틀방 ID: %d)", battleId)
            );
        }
    }


}
