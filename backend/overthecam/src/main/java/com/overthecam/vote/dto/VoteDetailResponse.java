package com.overthecam.vote.dto;

import com.overthecam.vote.domain.Vote;
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
    private String creatorNickname;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private boolean isActive;
    private List<VoteOptionDetail> options;  // 이름 변경
    private List<VoteComment> comments;
    private Long commentCount;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoteOptionDetail {    // 이름 변경
        private Long optionId;
        private String optionTitle;
        private int voteCount;
        private double votePercentage;
        private Map<String, Double> ageDistribution;
        private Map<String, Double> genderDistribution;
    }

    public static VoteDetailResponse of(
        Vote vote,
        List<VoteComment> comments,
        Map<Long, Map<String, Double>> ageStats,
        Map<Long, Map<String, Double>> genderStats
    ) {
        // 총 투표 수 계산 - 엔티티의 getVoteCount() 메서드 사용
        int totalVotes = vote.getOptions().stream()
            .mapToInt(com.overthecam.vote.domain.VoteOption::getVoteCount)  // 전체 패키지 경로 명시
            .sum();

        // 옵션 변환
        List<VoteOptionDetail> options = vote.getOptions().stream()
            .map(option -> {
                double percentage = totalVotes > 0 ?
                    (double) option.getVoteCount() / totalVotes * 100 : 0;

                return VoteOptionDetail.builder()
                    .optionId(option.getVoteOptionId())
                    .optionTitle(option.getOptionTitle())
                    .voteCount(option.getVoteCount())
                    .votePercentage(Math.round(percentage * 10.0) / 10.0)
                    .ageDistribution(ageStats.getOrDefault(option.getVoteOptionId(), new HashMap<>()))
                    .genderDistribution(genderStats.getOrDefault(option.getVoteOptionId(), new HashMap<>()))
                    .build();
            })
            .collect(Collectors.toList());

        return VoteDetailResponse.builder()
            .voteId(vote.getVoteId())
            .title(vote.getTitle())
            .content(vote.getContent())
            .creatorNickname(vote.getUser().getNickname())
            .endDate(vote.getEndDate())
            .createdAt(vote.getCreatedAt())
            .isActive(vote.isActive())
            .options(options)
            .comments(comments)
            .commentCount((long) comments.size())
            .build();
    }

    // 댓글 없이 기본 통계 정보만 포함하는 팩토리 메서드
    public static VoteDetailResponse of(
        Vote vote,
        Map<Long, Map<String, Double>> ageStats,
        Map<Long, Map<String, Double>> genderStats
    ) {
        return of(vote, Collections.emptyList(), ageStats, genderStats);
    }
}