package com.overthecam.auth.config;
// JWT 관련 설정값을 주입받는 클래스

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret;                              // JWT 서명에 사용할 비밀키
    private long accessTokenValidityInMilliseconds;     // Access Token 만료 시간
    private long refreshTokenValidityInMilliseconds;    // Refresh Token 만료 시간
    private String tokenPrefix;                         // 토큰 접두사
    public static final String TOKEN_TYPE = "Bearer";   // 토큰 타입
}