package com.overthecam.member.dto;

import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.vote.dto.VoteStatsProjection;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class BattleCombinedStatusDto {
    private final Long battleId;
    private final String title;
    private final Integer totalTime;
    private final String hostNickname;
    private final ParticipantRole role;
    private final List<String> participants;
    private final String selectedOption;
    private final boolean isWinner;
    private final Integer earnedScore;
    private final LocalDateTime createdAt;
    private final List<VoteStatsProjection> voteStats;
}
