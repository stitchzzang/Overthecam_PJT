package com.overthecam.member.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FollowResponse {
    private Long followerId;
    private Long followingId;
}
