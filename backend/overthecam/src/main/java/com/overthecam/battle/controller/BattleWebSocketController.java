package com.overthecam.battle.controller;

import com.overthecam.battle.dto.BattleWebSocketMessage;
import com.overthecam.battle.service.BattleWebSocketService;
import com.overthecam.websocket.dto.UserPrincipal;
import com.overthecam.websocket.dto.WebSocketResponseDto;
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
public class BattleWebSocketController {

    private final BattleWebSocketService battleWebSocketService;

    @MessageMapping("/battle/{battleId}")
    @SendTo("/api/subscribe/battle/{battleId}")
    public WebSocketResponseDto<?> handleBattleEvent(BattleWebSocketMessage message, @DestinationVariable Long battleId, SimpMessageHeaderAccessor headerAccessor) {
        log.debug("Received battle event - battleId: {}, message type: {}, message: {}",
            battleId, message.getType(), message);

        UserPrincipal user = WebSocketSecurityUtils.getUser(headerAccessor);
        log.debug("User authenticated - userId: {}, email: {}", user.getUserId(), user.getEmail());

        WebSocketResponseDto<?> response = switch (message.getType()) {
            case BATTLE_START -> {
                log.debug("Processing BATTLE_START request");
                yield battleWebSocketService.handleBattleStart(message, user.getUserId());
            }
            case CHEER_UPDATE -> {
                log.debug("Processing CHEER_UPDATE request");
                yield battleWebSocketService.handleCheerUpdate(message, user.getUserId());
            }
            case POINT_UPDATE -> {
                log.debug("Processing POINT_UPDATE request");
                yield battleWebSocketService.handlePointUpdate(message, user.getUserId());
            }
            default -> throw new IllegalArgumentException("Unknown message type: " + message.getType());
        };

        log.debug("Sending response: {}", response);
        return response;
    }

}
