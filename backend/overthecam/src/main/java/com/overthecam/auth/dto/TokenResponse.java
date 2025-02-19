package com.overthecam.auth.dto;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String grantType;        // "Bearer" 값을 가짐
    private Long accessTokenExpiresIn;  // 만료 시간
    private Long userId;
    private String nickname;
    private String profileImage;
    private int supportScore;
    private int point;

    @Builder.Default
    private boolean hasExistingSession = false;

    public void updateSessionInfo(boolean sessionInfo){
        this.hasExistingSession = sessionInfo;
    }
}