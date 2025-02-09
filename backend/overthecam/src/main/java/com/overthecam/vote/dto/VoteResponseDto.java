package com.overthecam.vote.dto;
/**
 * 투표 상세 응답
    * 투표 기본 정보
     * 옵션별 투표 수
     * 연령대/성별 분포
     * 댓글 정보
 */

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteResponseDto {
    private Long voteId;
    private Long battleId;
    private String title;
    private String content;
    private String creatorNickname;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private boolean isActive;

    private List<VoteOptionDetailDto> options;
    private List<VoteCommentDto> comments;
    private Long commentCount;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoteOptionDetailDto {
        private Long optionId;
        private String optionTitle;
        private int voteCount;
        private double votePercentage;
        private Map<String, Double> ageDistribution;
        private Map<String, Double> genderDistribution;
    }
}