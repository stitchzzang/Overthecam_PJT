package com.overthecam.websocket.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.exception.websocket.WebSocketErrorCode;
import com.overthecam.exception.websocket.WebSocketException;
import com.overthecam.websocket.service.BattleDataService;
import com.overthecam.websocket.service.ChatMessageService;
import com.overthecam.websocket.dto.*;
import com.overthecam.websocket.util.WebSocketSecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class BattleBroadcastController {

    private final ChatMessageService chatMessageService;
    private final BattleDataService battleDataService;
    private final ObjectMapper objectMapper;



    // 배틀 브로드캐스트 - 채팅, 배틀 초기 데이터
    @MessageMapping("/battle/{battleId}")
    @SendTo("/api/subscribe/battle/{battleId}")
    public WebSocketResponseDto<?> broadcast(WebSocketRequestDto<?> request,
                                                     @DestinationVariable Long battleId,
                                                     SimpMessageHeaderAccessor headerAccessor) {

        UserPrincipal user = WebSocketSecurityUtils.getUser(headerAccessor);
        log.debug("User authenticated - userId: {}, email: {}", user.getUserId(), user.getEmail());

        return switch (request.getType()) {
            case BATTLE_START -> WebSocketResponseDto.success(
                    MessageType.BATTLE_START,
                    battleDataService.handleBattleStart(battleId)
                );

            case BATTLER_SELECT -> WebSocketResponseDto.success(
                MessageType.BATTLER_SELECT,
                battleDataService.getBattlerParticipants(battleId)
            );

            case CHAT -> {
                // Object를 ChatMessageRequest로 안전하게 변환
                ChatMessageRequest chatData;
                try {
                    chatData = objectMapper.convertValue(request.getData(), ChatMessageRequest.class);
                } catch (IllegalArgumentException e) {
                    log.error("Failed to convert chat message data", e);
                    throw new WebSocketException(WebSocketErrorCode.INVALID_MESSAGE_FORMAT, "지원하지 않는 메시지 타입입니다.");
                }

                yield WebSocketResponseDto.success(
                        MessageType.CHAT,
                        chatMessageService.sendMessage(chatData, user)
                );
            }

            default -> throw new IllegalArgumentException("Unknown type request: " + request.getType());
        };
    }

}
