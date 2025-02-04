package com.overthecam.vote.dto;

import com.overthecam.exception.vote.VoteErrorCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class VoteResponseDto {
    // 기본 투표 정보
    private Long voteId;
    private Long battleId;
    private String title;
    private String content;
    private String creatorNickname;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private boolean isActive;
    // 옵션 및 댓글 정보
    private List<VoteOptionDetailDto> options;
    private List<VoteCommentDto> comments;

    // 내부 클래스: 투표 옵션 상세 정보
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoteOptionDetailDto {
        private Long optionId;
        private String optionTitle;
        private int voteCount;
        private double votePercentage;
        private Map<String, Double> ageDistribution;    // 연령대별 분포
        private Map<String, Double> genderDistribution; // 성별 분포
    }
}