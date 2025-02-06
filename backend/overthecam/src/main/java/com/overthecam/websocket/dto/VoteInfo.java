package com.overthecam.websocket.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class VoteInfo {
    private Long voteId;
    private Long battleId;
    private String title;                    // 투표 제목
    private List<VoteOptionInfo> options;    // 투표 옵션들
    private LocalDateTime endDate;           // 종료 시간
    private boolean isActive;                // 투표 활성화 여부
    private int totalVoteCount;

    @Getter
    @Builder
    public static class VoteOptionInfo {
        private Long optionId;
        private String optionTitle;          // 옵션 제목
        private int voteCount;               // 득표수
        private double votePercentage;       // 득표율
        private boolean isWinner;            // 승자 여부
    }
}
