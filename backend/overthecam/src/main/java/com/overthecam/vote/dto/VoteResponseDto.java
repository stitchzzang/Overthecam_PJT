package com.overthecam.vote.dto;

import com.overthecam.exception.vote.VoteErrorCode;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class VoteResponseDto {
    private Long voteId;
    private Long battleId;
    private String title;
    private String content;
    private String creatorNickname;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private boolean isActive;
    private List<VoteOptionDto> options;
    private Integer userSupportScore;
    private Map<String, Double> ageGroupStats;
    private Map<String, Double> genderStats;
    private List<VoteCommentDto> comments;

    @Getter
    @Builder
    public static class VoteOptionDto {
        private Long optionId;
        private String optionTitle;
        private int voteCount;
        private double votePercentage;
    }
}