package com.overthecam.websocket.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class VoteInfo {
    private Long voteId;
    private String title;                    // 투표 제목
    private List<VoteOptionInfo> options;    // 투표 옵션들

    @Getter
    @Builder
    public static class VoteOptionInfo {
        private Long optionId;
        private String optionTitle;          // 옵션 제목
    }
}
