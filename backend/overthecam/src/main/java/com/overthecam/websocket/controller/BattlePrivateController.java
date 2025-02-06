package com.overthecam.websocket.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.websocket.dto.UserScoreInfo;
import com.overthecam.websocket.dto.*;
import com.overthecam.websocket.service.BattleDataService;
import com.overthecam.websocket.util.WebSocketSecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class BattlePrivateController {

    private final BattleDataService battleDataService;
    private final ObjectMapper objectMapper;

    // 배틀 개인 공지 - 포인트, 응원 점수, 투표
    @MessageMapping("/battle/private/{battleId}")
    @SendToUser("/queue/battle/{battleId}")
    public WebSocketResponseDto<?> privateNotify(WebSocketRequestDto<?> request,
                                                     @DestinationVariable Long battleId,
                                                     SimpMessageHeaderAccessor headerAccessor) {
        UserPrincipal user = WebSocketSecurityUtils.getUser(headerAccessor);
        log.debug("User authenticated - userId: {}, email: {}", user.getUserId(), user.getEmail());

        UserScoreInfo userScoreInfo = objectMapper.convertValue(request.getData(), UserScoreInfo.class);

        return switch (request.getType()) {
            case CHEER_UPDATE ->
                    WebSocketResponseDto.success(
                            MessageType.CHEER_UPDATE,
                            battleDataService.handleCheerUpdate(userScoreInfo.getSupportScore(), user.getUserId())
                    );
            case POINT_UPDATE ->
                    WebSocketResponseDto.success(
                            MessageType.POINT_UPDATE,
                            battleDataService.handlePointUpdate(userScoreInfo.getPoint(), user.getUserId())
                    );
            default -> throw new IllegalArgumentException("Unknown request type: " + request.getType());
        };
    }
}
