package com.overthecam.auth.dto;

import com.overthecam.auth.domain.User;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class UserResponse {
    private Long userId;
    private String email;
    private String username;
    private String nickname;
    private Integer supportScore;
    private Integer point;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .supportScore(user.getSupportScore())
                .point(user.getPoint())
                .build();
    }
}