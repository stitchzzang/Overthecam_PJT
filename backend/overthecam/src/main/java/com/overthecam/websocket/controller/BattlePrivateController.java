package com.overthecam.websocket.controller;

import com.overthecam.battle.service.BattleBettingService;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.websocket.dto.*;
import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;
import com.overthecam.websocket.service.BattleReadyService;
import com.overthecam.websocket.service.BattleVoteService;
import com.overthecam.websocket.util.WebSocketRequestMapper;
import com.overthecam.websocket.util.WebSocketSecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class BattlePrivateController {

    private final BattleBettingService battleBettingService;
    private final BattleReadyService battleReadyService;
    private final BattleVoteService battleVoteService;
    private final WebSocketRequestMapper requestMapper;

    // 배틀 개인 공지
    @MessageMapping("/battle/private/{battleId}")
    @SendToUser("/queue/battle/{battleId}")
    public WebSocketResponseDto<?> handlePrivate(
            @DestinationVariable Long battleId,
            @Payload WebSocketRequestDto<?> request,
            SimpMessageHeaderAccessor headerAccessor) {

        UserPrincipal user = authenticateUser(headerAccessor);

        try {
            switch (request.getType()) {
                case ROOM_STATUS: // 현재 방의 상태 정보를 조회
                    BattleRoomStatus status = BattleRoomStatus.builder()
                        .readyUsers(battleReadyService.getReadyUsers(battleId))
                        .voteInfo(battleVoteService.getCurrentVote(battleId))
                        .build();
                    return WebSocketResponseDto.ok(MessageType.ROOM_STATUS, status);

                case USER_SCORE:
                    UserScoreInfo userScore = battleBettingService.prepareBattle(battleId, user.getUserId());
                    return WebSocketResponseDto.ok(MessageType.USER_SCORE, userScore);

                default:
                    throw new WebSocketException(WebSocketErrorCode.INVALID_MESSAGE_FORMAT, "올바르지 않은 메시지 타입입니다.");
            }
        } catch (IllegalArgumentException e) {
            log.error("Failed to convert request data", e);
            throw new WebSocketException(WebSocketErrorCode.INVALID_MESSAGE_FORMAT, "올바르지 않은 메시지 타입입니다.");
        }
    }

    private UserPrincipal authenticateUser(SimpMessageHeaderAccessor headerAccessor) {
        UserPrincipal user = WebSocketSecurityUtils.getUser(headerAccessor);
        log.debug("User authenticated - userId: {}, email: {}", user.getUserId(), user.getEmail());
        return user;
    }

}
