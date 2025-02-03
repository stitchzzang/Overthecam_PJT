package com.overthecam.vote.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class VoteResponseDto {
    private Long voteId;
    private String title;
    private String content;
    private String creatorNickname;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private boolean isActive;
    private List<VoteOptionDto> options;
    private Integer userSupportScore; // 현재 사용자의 응원 점수
    private Map<String, Double> ageGroupStats;  // 상세 조회시에만 포함
    private Map<String, Double> genderStats;    // 상세 조회시에만 포함
    private List<VoteCommentDto> comments;      // 상세 조회시에만 포함

    @Getter
    @Builder
    public static class VoteOptionDto {
        private Long optionId;
        private String optionTitle;
        private int voteCount;
        private double votePercentage;

    }
}
