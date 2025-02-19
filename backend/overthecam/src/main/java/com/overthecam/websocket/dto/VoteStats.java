package com.overthecam.websocket.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VoteStats {
    private int participantCount;   // 배틀 참여자 수
    private int votedCount;         // 투표 완료한 수
}
