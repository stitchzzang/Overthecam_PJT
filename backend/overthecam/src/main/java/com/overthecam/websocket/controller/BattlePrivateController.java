package com.overthecam.websocket.controller;

import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.websocket.dto.*;
import com.overthecam.websocket.service.UserScoreService;
import com.overthecam.websocket.util.WebSocketRequestMapper;
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

    private final UserScoreService userScoreService;
    private final WebSocketRequestMapper requestMapper;

    // 배틀 개인 공지 - 포인트, 응원 점수, 투표
    @MessageMapping("/battle/private/{battleId}")
    @SendToUser("/queue/battle/{battleId}")
    public WebSocketResponseDto<?> privateNotify(WebSocketRequestDto<?> request,
                                                     @DestinationVariable Long battleId,
                                                     SimpMessageHeaderAccessor headerAccessor) {
        UserPrincipal user = authenticateUser(headerAccessor);
        UserScoreInfo userScoreInfo = requestMapper.mapToUserScoreInfo(request.getData());

        return createResponse(request.getType(), user.getUserId(), userScoreInfo);
    }

    private UserPrincipal authenticateUser(SimpMessageHeaderAccessor headerAccessor) {
        UserPrincipal user = WebSocketSecurityUtils.getUser(headerAccessor);
        log.debug("User authenticated - userId: {}, email: {}", user.getUserId(), user.getEmail());
        return user;
    }

    private WebSocketResponseDto<?> createResponse(MessageType type, Long userId, UserScoreInfo scoreInfo) {
        return switch (type) {
            case USER_SCORE -> createUserScoreResponse(userId);
            case CHEER_UPDATE -> createCheerUpdateResponse(userId, scoreInfo.getSupportScore());
            case POINT_UPDATE -> createPointUpdateResponse(userId, scoreInfo.getPoint());
            default -> throw new IllegalArgumentException("Unknown request type: " + type);
        };
    }

    private WebSocketResponseDto<?> createUserScoreResponse(Long userId) {
        return WebSocketResponseDto.ok(
            MessageType.USER_SCORE,
            userScoreService.getUserScore(userId)
        );
    }

    private WebSocketResponseDto<?> createCheerUpdateResponse(Long userId, Integer score) {
        return WebSocketResponseDto.ok(
            MessageType.CHEER_UPDATE,
            userScoreService.updateSupportScore(userId, score)
        );
    }

    private WebSocketResponseDto<?> createPointUpdateResponse(Long userId, Integer points) {
        return WebSocketResponseDto.ok(
            MessageType.POINT_UPDATE,
            userScoreService.updatePoints(userId, points)
        );
    }
}
