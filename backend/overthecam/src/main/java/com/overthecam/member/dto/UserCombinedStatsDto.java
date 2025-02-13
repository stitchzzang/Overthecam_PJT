package com.overthecam.member.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserCombinedStatsDto {
    private UserProfileInfo profileInfo;
    private UserScoreInfo scoreInfo;
    private FollowStatsInfo followStats;
    private BattleStatsInfo battleStats;
}
