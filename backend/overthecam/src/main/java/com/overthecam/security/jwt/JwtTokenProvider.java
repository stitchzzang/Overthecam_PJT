package com.overthecam.security.jwt;
// JWT 토큰의 생성, 검증, 파싱 등 토큰 관련 모든 작업을 처리

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
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    // JWT 토큰 생성 및 검증

    private final JwtProperties jwtProperties;
    private Key key;

    @PostConstruct
    public void init() {
        // Base64 디코딩된 비밀키를 사용하여 서명 키 초기화
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // 토큰 생성 메서드 (Access Token + Refresh Token)
    public TokenResponse createToken(User user) {

        // 사용자 정보로 클레임 생성
        Map<String, Object> claims = createClaims(user);

        // 토큰 만료 시간 설정
        Date now = new Date();
        Date accessTokenValidity = getExpirationTime(now,
                jwtProperties.getAccessExpiration());
        Date refreshTokenValidity = getExpirationTime(now,
                jwtProperties.getRefreshExpiration());

        // 액세스, 리프레시 토큰 발급
        String accessToken = buildToken(claims, now, accessTokenValidity);
        String refreshToken = buildToken(claims, now, refreshTokenValidity);

        return TokenResponse.builder()
                .grantType(JwtProperties.TYPE.trim())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpiresIn(accessTokenValidity.getTime())
                .build();
    }

    // Access Token만 새로 생성
    // Refresh Token으로 검증된 사용자에게 새로운 Access Token을 발급할 때 사용
    public String recreateAccessToken(User user) {
        Map<String, Object> claims = createClaims(user);
        Date now = new Date();
        Date validity = getExpirationTime(now, jwtProperties.getAccessExpiration());

        return buildToken(claims, now, validity);
    }

    // 토큰에 포함될 사용자 정보(클레임) 생성
    private Map<String, Object> createClaims(User user) {
        return Map.of(
                "userId", user.getUserId(),
                "email", user.getEmail()
        );
    }

    // JWT 토큰 생성
    private String buildToken(Map<String, Object> claims, Date issuedAt, Date expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰 만료 시간
    private Date getExpirationTime(Date now, long validityInMilliseconds) {
        return new Date(now.getTime() + validityInMilliseconds);
    }

    // 토큰에서 이메일 추출
    public Long getUserId(String token) {
        Claims claims = getClaims(token);
        return claims.get("userId", Long.class);
    }

    // 토큰에서 사용자 ID 추출
    public String getEmail(String token) {
        Claims claims = getClaims(token);
        return claims.get("email", String.class);
    }

    // 토큰 검증 및 클레임 추출
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
            getClaims(token);  // 한 번의 파싱으로 검증
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // 토큰 만료 여부 확인
    public boolean isExpiredToken(String token) {
        try {
            getClaims(token);
            return false;
        } catch (ExpiredJwtException e) {
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;  // 만료가 아닌 다른 이유로 유효하지 않은 경우
        }
    }
}