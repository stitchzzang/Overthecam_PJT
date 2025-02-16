package com.overthecam.websocket.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.vote.dto.VoteRequest;
import com.overthecam.websocket.dto.BattleReadyUser;
import com.overthecam.websocket.dto.ChatMessageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketRequestMapper {
    private final ObjectMapper objectMapper;

    public UserScoreInfo mapToUserScoreInfo(Object data) {
        return objectMapper.convertValue(data, UserScoreInfo.class);
    }

    public ChatMessageRequest mapToChatMessageRequest(Object data) {
        return objectMapper.convertValue(data, ChatMessageRequest.class);
    }

    public BattleReadyUser mapToBattleReadyStatus(Object data){
        return objectMapper.convertValue(data, BattleReadyUser.class);
    }

    public VoteRequest mapToVoteRequestDto(Object data){
        return objectMapper.convertValue(data, VoteRequest.class);
    }

}
