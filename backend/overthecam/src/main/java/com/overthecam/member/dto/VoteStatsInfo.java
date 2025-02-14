package com.overthecam.member.dto;

import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.domain.VoteOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteStatsInfo {

    private Long voteId;
    private String title;
    private String content;
    private Long battleId;
    private Long creatorUserId;
    private String creatorNickname;
    private boolean isActive;
    private boolean hasVoted;
    private int totalVoteCount;
    private List<VoteOptionDetail> options;

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
    }

    public static VoteStatsInfo of(
        Vote vote,
        boolean hasVoted,
        Map<Long, Boolean> selectionStatus
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
                    .build();
            })
            .collect(Collectors.toList());

        VoteStatsInfoBuilder builder = VoteStatsInfo.builder()
            .voteId(vote.getVoteId())
            .title(vote.getTitle())
            .content(vote.getContent())
            .battleId(vote.getBattle() != null ? vote.getBattle().getId() : null)  // null 체크 추가
            .creatorUserId(vote.getUser().getId())
            .creatorNickname(vote.getUser().getNickname())
            .isActive(vote.isActive())
            .hasVoted(hasVoted)
            .totalVoteCount(totalVotes)
            .options(options);

        return builder.build();
    }
}
