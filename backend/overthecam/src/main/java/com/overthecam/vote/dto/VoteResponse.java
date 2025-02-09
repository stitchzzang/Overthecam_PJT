package com.overthecam.vote.dto;
/**
 * 투표 상세 응답
    * 투표 기본 정보
     * 옵션별 투표 수
     * 연령대/성별 분포
     * 댓글 정보
 */

import com.overthecam.vote.domain.Vote;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteResponse {
    private Long voteId;
    private String title;
    private String content;
    private String creatorNickname;
    private LocalDateTime endDate;
    private boolean isActive;
    private List<VoteOptionDto> options;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoteOptionDto {
        private Long optionId;
        private String optionTitle;
    }

    public static VoteResponse from(Vote vote) {
        List<VoteOptionDto> options = vote.getOptions().stream()
            .map(option -> VoteOptionDto.builder()
                .optionId(option.getVoteOptionId())
                .optionTitle(option.getOptionTitle())
                .build())
            .collect(Collectors.toList());

        return VoteResponse.builder()
            .voteId(vote.getVoteId())
            .title(vote.getTitle())
            .content(vote.getContent())
            .creatorNickname(vote.getUser().getNickname())
            .endDate(vote.getEndDate())
            .isActive(vote.isActive())
            .options(options)
            .build();
    }
}