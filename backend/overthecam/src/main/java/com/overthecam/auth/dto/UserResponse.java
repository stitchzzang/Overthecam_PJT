package com.overthecam.auth.dto;

import com.overthecam.auth.domain.User;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class UserResponse {
    private Long userId;
    private String email;
    private String nickname;
    private Integer supportScore;
    private Integer point;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .supportScore(user.getSupportScore())
                .point(user.getPoint())
                .build();
    }
}