package com.overthecam.websocket.controller;

import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;
import com.overthecam.websocket.service.BattleDataService;
import com.overthecam.websocket.service.BattleWebsocketService;
import com.overthecam.websocket.service.ChatMessageService;
import com.overthecam.websocket.dto.*;
import com.overthecam.websocket.util.WebSocketRequestMapper;
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

    private final BattleDataService battleDataService;
    private final BattleWebsocketService battleWebsocketService;
    private final ChatMessageService chatMessageService;
    private final WebSocketRequestMapper requestMapper;

    @MessageMapping("/battle/{battleId}")
    @SendTo("/api/subscribe/battle/{battleId}")
    public WebSocketResponseDto<?> broadcast(
        WebSocketRequestDto<?> request,
        @DestinationVariable Long battleId,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        UserPrincipal user = authenticateUser(headerAccessor);

        return switch (request.getType()) {
            case BATTLE_START -> WebSocketResponseDto.ok(
                MessageType.BATTLE_START,
                battleDataService.handleBattleStart(battleId)
            );
            case BATTLER_SELECT -> WebSocketResponseDto.ok(
                MessageType.BATTLER_SELECT,
                battleWebsocketService.getBattlerNotification(battleId)
            );
            case CHAT -> handleChatMessage(request.getData(), user);
            default -> throw new IllegalArgumentException("Unknown request type: " + request.getType());
        };
    }

    private UserPrincipal authenticateUser(SimpMessageHeaderAccessor headerAccessor) {
        UserPrincipal user = WebSocketSecurityUtils.getUser(headerAccessor);
        log.debug("User authenticated - userId: {}, email: {}", user.getUserId(), user.getEmail());
        return user;
    }

    private WebSocketResponseDto<?> handleChatMessage(Object data, UserPrincipal user) {
        try {
            ChatMessageRequest chatRequest = requestMapper.mapToChatMessageRequest(data);
            return WebSocketResponseDto.ok(
                MessageType.CHAT,
                chatMessageService.sendMessage(chatRequest, user)
            );
        } catch (IllegalArgumentException e) {
            log.error("Failed to convert chat message data", e);
            throw new WebSocketException(
                WebSocketErrorCode.INVALID_MESSAGE_FORMAT,
                "지원하지 않는 메시지 타입입니다."
            );
        }
    }

}
