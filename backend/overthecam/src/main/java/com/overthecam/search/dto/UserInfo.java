package com.overthecam.search.dto;

import com.overthecam.auth.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInfo {
    private Long userId;
    private String nickname;
    private String profileImage;

    public static UserInfo from(User user) {
        return UserInfo.builder()
                .userId(user.getId())
                .profileImage(user.getProfileImage())
                .nickname(user.getNickname())
                .build();
    }
}
