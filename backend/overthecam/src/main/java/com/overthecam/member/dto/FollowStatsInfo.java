package com.overthecam.member.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FollowStatsInfo {
    private Long userId;
    private long followerCount;
    private long followingCount;
}