package com.overthecam.websocket.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class VoteInfo {
    private Long voteId;
    private String title;                    // 투표 제목
    private String content;
    private List<VoteOptionInfo> options;    // 투표 옵션들

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoteOptionInfo {
        private Long optionId;
        private String optionTitle;          // 옵션 제목
    }
}
