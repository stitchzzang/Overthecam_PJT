package com.overthecam.chat.service;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.chat.dto.ChatMessageRequest;
import com.overthecam.chat.dto.ChatMessageResponse;
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

    private final BattleRepository battleRepository;

    public WebSocketResponseDto<?> sendMessage(ChatMessageRequest request, Long chatRoomId,
                                               UserPrincipal user) {
        validateChatRoom(request.getBattleId());

        return WebSocketResponseDto.messageSendSuccess(
                ChatMessageResponse.builder()
                        .battleId(request.getBattleId())
                        .nickname(user.getNickname())  // UserPrincipal에서 직접 가져오기
                        .content(request.getContent())
                        .timestamp(LocalDateTime.now())
                        .build());
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
