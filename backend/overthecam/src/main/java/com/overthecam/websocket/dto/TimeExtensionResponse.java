package com.overthecam.websocket.dto;

import com.overthecam.member.dto.UserScoreInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeExtensionResponse {
    private Long userId;
    private String nickname;
    private UserScoreInfo userScore;
}
