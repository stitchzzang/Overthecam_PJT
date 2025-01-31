package com.overthecam.auth.security;

import com.overthecam.auth.config.JwtProperties;
import com.overthecam.auth.domain.User;
import com.overthecam.auth.dto.TokenResponse;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    // JWT 토큰 생성 및 검증을 담당하는 컴포넌트

    private final JwtProperties jwtProperties;
    private Key key;

    @PostConstruct
    public void init() {
        // Base64 디코딩된 비밀키를 사용하여 서명 키 초기화
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // 토큰 생성 메서드
    public TokenResponse createToken(User user) {
        // 사용자 정보로 클레임 생성
        Map<String, Object> claims = createClaims(user);
        // 토큰 만료 시간 설정
        Date now = new Date();
        Date accessTokenValidity = getExpirationTime(now, jwtProperties.getAccessTokenValidityInMilliseconds());
        Date refreshTokenValidity = getExpirationTime(now, jwtProperties.getRefreshTokenValidityInMilliseconds());

        // 액세스, 리프레시 토큰 발급
        String accessToken = buildToken(claims, now, accessTokenValidity);
        String refreshToken = buildToken(claims, now, refreshTokenValidity);

        return TokenResponse.builder()
                .grantType(jwtProperties.getTokenPrefix().trim())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpiresIn(accessTokenValidity.getTime())
                .build();
    }

    public String recreateAccessToken(User user) {
        Map<String, Object> claims = createClaims(user);
        Date now = new Date();
        Date validity = getExpirationTime(now, jwtProperties.getAccessTokenValidityInMilliseconds());

        return buildToken(claims, now, validity);
    }

    private Map<String, Object> createClaims(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("email", user.getEmail());
        return claims;
    }

    private String buildToken(Map<String, Object> claims, Date issuedAt, Date expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private Date getExpirationTime(Date now, long validityInMilliseconds) {
        return new Date(now.getTime() + validityInMilliseconds);
    }

    public Long getUserId(String token) {
        Claims claims = getClaims(token);
        return claims.get("userId", Long.class);
    }

    public String getEmail(String token) {
        Claims claims = getClaims(token);
        return claims.get("email", String.class);
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 토큰 검증 메서드
    public boolean validateToken(String token) {
        try {
            // 토큰 파싱 및 서명 검증
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isExpiredToken(String token) {
        try {
            getClaims(token);
            return false;
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}