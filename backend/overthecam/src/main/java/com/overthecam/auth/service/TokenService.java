package com.overthecam.auth.service;

import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.security.jwt.JwtTokenProvider;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {
    private final StringRedisTemplate redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    private static class RedisKeys {
        private static final String REFRESH_TOKEN = "auth:refresh:";
        private static final String ACCESS_TOKEN_BLACKLIST = "auth:blacklist:";

        public static String refreshToken(Long userId) {
            return REFRESH_TOKEN + userId;
        }

        public static String blacklist(String token) {
            return ACCESS_TOKEN_BLACKLIST + token;
        }
    }

    public void saveRefreshToken(Long userId, String refreshToken, long expirationTime) {
        try {
            String key = RedisKeys.refreshToken(userId);
            redisTemplate.opsForValue().set(
                key,
                refreshToken,
                expirationTime,
                TimeUnit.MILLISECONDS
            );
        } catch (Exception e) {
            log.error("Redis에 Refresh Token 저장 실패", e);
            throw new GlobalException(AuthErrorCode.SERVER_ERROR, "토큰 저장에 실패했습니다");
        }
    }

    public void addToBlacklist(String accessToken) {
        try {
            if (accessToken != null) {
                String key = RedisKeys.blacklist(accessToken);
                long expiration = jwtTokenProvider.getExpirationTime(accessToken);
                redisTemplate.opsForValue().set(
                    key,
                    "blacklisted",
                    expiration,
                    TimeUnit.MILLISECONDS
                );
            }
        } catch (Exception e) {
            log.error("Redis에 Access Token 블랙리스트 추가 실패", e);
            throw new GlobalException(AuthErrorCode.SERVER_ERROR, "토큰 블랙리스트 추가에 실패했습니다");
        }
    }

    public boolean isBlacklisted(String accessToken) {
        try {
            String key = RedisKeys.blacklist(accessToken);
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("Redis에서 블랙리스트 체크 실패", e);
            return false;
        }
    }

    public boolean validateRefreshToken(Long userId, String refreshToken) {
        try {
            String key = RedisKeys.refreshToken(userId);
            String storedToken = redisTemplate.opsForValue().get(key);
            return refreshToken.equals(storedToken);
        } catch (Exception e) {
            log.error("Redis에서 Refresh Token 검증 실패", e);
            return false;
        }
    }

    public void logout(Long userId, String accessToken) {
        try {
            // Refresh Token 삭제
            redisTemplate.delete(RedisKeys.refreshToken(userId));

            // Access Token 블랙리스트 추가
            addToBlacklist(accessToken);
        } catch (Exception e) {
            log.error("로그아웃 처리 중 오류 발생", e);
            throw new GlobalException(AuthErrorCode.LOGOUT_FAILED, "로그아웃 처리에 실패했습니다");
        }
    }
}
