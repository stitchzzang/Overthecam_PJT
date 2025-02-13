package com.overthecam.vote.dto;

import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.domain.VoteOption;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteDetailResponse {
    private Long voteId;
    private String title;
    private String content;
    private Long creatorUserId;
    private String creatorNickname;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private boolean isActive;
    private boolean hasVoted;
    private int totalVoteCount;

    private List<VoteOptionDetail> options;
    private List<VoteComment> comments;
    private Long commentCount;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoteOptionDetail {
        private Long optionId;
        private String optionTitle;
        private int voteCount;
        private double votePercentage;
        private boolean isSelected;
        private Map<String, Double> ageDistribution;
        private Map<String, Double> genderDistribution;
    }

    // 목록 조회용 팩토리 메서드
    public static VoteDetailResponse ofList(
            Vote vote,
            boolean hasVoted,
            Map<Long, Boolean> selectionStatus,
            long commentCount
    ) {
        return createVoteDetailResponse(
                vote,
                hasVoted,
                null,
                selectionStatus,
                Collections.emptyMap(),
                Collections.emptyMap(),
                commentCount
        );
    }

    // 상세 조회용 팩토리 메서드
    public static VoteDetailResponse ofDetail(
            Vote vote,
            boolean hasVoted,
            List<VoteComment> comments,
            Map<Long, Boolean> selectionStatus,
            Map<Long, Map<String, Double>> ageStats,
            Map<Long, Map<String, Double>> genderStats
    ) {
        return createVoteDetailResponse(
                vote,
                hasVoted,
                comments,
                selectionStatus,
                ageStats,
                genderStats,
                comments != null ? (long) comments.size() : 0L
        );
    }

    // 내부 구현 메서드
    private static VoteDetailResponse createVoteDetailResponse(
            Vote vote,
            boolean hasVoted,
            List<VoteComment> comments,
            Map<Long, Boolean> selectionStatus,
            Map<Long, Map<String, Double>> ageStats,
            Map<Long, Map<String, Double>> genderStats,
            Long commentCount
    ) {
        int totalVotes = vote.getOptions().stream()
                .mapToInt(VoteOption::getVoteCount)
                .sum();

        List<VoteOptionDetail> options = vote.getOptions().stream()
                .map(option -> {
                    double percentage = totalVotes > 0 ?
                            (double) option.getVoteCount() / totalVotes * 100 : 0;

                    return VoteOptionDetail.builder()
                            .optionId(option.getVoteOptionId())
                            .optionTitle(option.getOptionTitle())
                            .voteCount(option.getVoteCount())
                            .votePercentage(Math.round(percentage * 10.0) / 10.0)
                            .isSelected(selectionStatus.getOrDefault(option.getVoteOptionId(), false))
                            .ageDistribution(ageStats.getOrDefault(option.getVoteOptionId(), new HashMap<>()))
                            .genderDistribution(genderStats.getOrDefault(option.getVoteOptionId(), new HashMap<>()))
                            .build();
                })
                .collect(Collectors.toList());

        return VoteDetailResponse.builder()
                .voteId(vote.getVoteId())
                .title(vote.getTitle())
                .content(vote.getContent())
                .creatorUserId(vote.getUser().getId())
                .creatorNickname(vote.getUser().getNickname())
                .endDate(vote.getEndDate())
                .createdAt(vote.getCreatedAt())
                .isActive(vote.isActive())
                .hasVoted(hasVoted)
                .totalVoteCount(totalVotes)
                .options(options)
                .comments(comments)  // 상세 조회시에만 값이 있음
                .commentCount(commentCount)
                .build();
    }
}