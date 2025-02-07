package com.overthecam.websocket.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BattleData {
    Long battleId;
    String sessionId;
    private List<ParticipantInfo> participants; // 참여자 정보
    private VoteInfo voteInfo; // 투표 정보
    private LocalDateTime timestamp;

    public static BattleData updateVote(VoteInfo voteInfo) {
        return BattleData.builder()
            .voteInfo(voteInfo)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
