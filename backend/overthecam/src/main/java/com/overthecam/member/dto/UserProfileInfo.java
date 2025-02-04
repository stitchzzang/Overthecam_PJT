package com.overthecam.member.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileInfo {
    private Long userId;
    private String nickname;
    private String profileImage;
}
