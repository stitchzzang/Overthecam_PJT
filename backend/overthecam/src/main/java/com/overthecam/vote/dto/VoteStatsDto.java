package com.overthecam.vote.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class VoteStatsDto {
    private final String voteTitle;
    private final String optionTitle;
    private final boolean isWinner;
    private final Long voteCount;
    private final Double votePercentage;

}
