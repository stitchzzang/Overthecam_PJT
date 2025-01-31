package com.overthecam.auth.config;

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
    private long accessTokenValidityInMilliseconds;     // 액세스 토큰 만료 시간
    private long refreshTokenValidityInMilliseconds;    // 리프레시 토큰 만료 시간
    private String tokenPrefix;                         // 토큰 접두사 (Bearer)
}