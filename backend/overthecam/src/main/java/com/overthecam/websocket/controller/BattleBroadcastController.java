package com.overthecam.websocket.controller;

import com.overthecam.battle.service.BattleResultService;
import com.overthecam.redis.service.BattleScoreRedisService;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.vote.dto.VoteRequest;
import com.overthecam.vote.service.VoteService;
import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;
import com.overthecam.websocket.service.BattleDataService;
import com.overthecam.websocket.service.BattleVoteService;
import com.overthecam.websocket.service.BattleWebsocketService;
import com.overthecam.websocket.service.ChatMessageService;
import com.overthecam.websocket.dto.*;
import com.overthecam.websocket.util.WebSocketRequestMapper;
import com.overthecam.websocket.util.WebSocketSecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class BattleBroadcastController {

    private final VoteService voteService;
    private final BattleDataService battleDataService;
    private final BattleWebsocketService battleWebsocketService;
    private final ChatMessageService chatMessageService;
    private final BattleVoteService battleVoteService;
    private final BattleResultService battleResultService;
    private final BattleScoreRedisService battleScoreRedisService;
    private final WebSocketRequestMapper requestMapper;

    private static final int TIME_EXTENSION_COST = 300;

    @MessageMapping("/battle/{battleId}")
    @SendTo("/api/subscribe/battle/{battleId}")
    public WebSocketResponseDto<?> handleBroadcast(
            @DestinationVariable Long battleId,
            @Payload WebSocketRequestDto<?> request,
            SimpMessageHeaderAccessor headerAccessor) {

        UserPrincipal user = authenticateUser(headerAccessor);

        try {
            switch (request.getType()) {
                case CHAT:
                    ChatMessageRequest chatRequest = requestMapper.mapToChatMessageRequest(request.getData());
                    return WebSocketResponseDto.ok(MessageType.CHAT,
                            chatMessageService.sendMessage(chatRequest, user));

                case BATTLE_START:
                    return WebSocketResponseDto.ok(MessageType.BATTLE_START,
                            battleDataService.handleBattleStart(battleId));

                case BATTLE_END:
                    return WebSocketResponseDto.ok(MessageType.BATTLE_END,
                            battleResultService.finalizeBattleVotes(battleId));

                case BATTLER_SELECT:
                    return WebSocketResponseDto.ok(MessageType.BATTLER_SELECT,
                            battleWebsocketService.getBattlerNotification(battleId));

                case VOTE_CREATE:
                    VoteRequest voteRequest = requestMapper.mapToVoteRequestDto(request.getData());
                    battleVoteService.deleteAndCreateNewVote(battleId);
                    return WebSocketResponseDto.ok(MessageType.VOTE_CREATE,
                            voteService.createVote(voteRequest, user.getUserId()));

                case TIME_EXTENSION:
                    UserScoreInfo updatedScore = battleScoreRedisService.deductPoints(
                            battleId, user.getUserId(), TIME_EXTENSION_COST);
                    return WebSocketResponseDto.ok(MessageType.TIME_EXTENSION,
                            TimeExtensionResponse.builder()
                                    .userId(user.getUserId())
                                    .nickname(user.getNickname())
                                    .userScore(updatedScore)
                                    .build());

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