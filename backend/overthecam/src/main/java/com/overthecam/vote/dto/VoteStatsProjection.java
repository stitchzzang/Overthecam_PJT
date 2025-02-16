package com.overthecam.vote.dto;

public interface VoteStatsProjection {
    String getTitle();

    String getOptionTitle();

    boolean getIsWinner();

    Long getVoteCount();

    Double getVotePercentage();
}
