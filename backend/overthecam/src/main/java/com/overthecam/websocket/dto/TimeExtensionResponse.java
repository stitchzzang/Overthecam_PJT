package com.overthecam.websocket.dto;

import com.overthecam.member.dto.UserScoreInfo;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TimeExtensionResponse {
    private Long userId;
    private String nickname;
    private UserScoreInfo userScore;
}
