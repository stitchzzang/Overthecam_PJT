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
        private static final String ACCESS_TOKEN = "auth:access:";
        private static final String ACCESS_TOKEN_BLACKLIST = "auth:blacklist:";

        public static String refreshToken(Long userId) {
            return REFRESH_TOKEN + userId;
        }

        public static String accessToken(Long userId) {
            return ACCESS_TOKEN + userId;
        }

        public static String blacklist(String token) {
            return ACCESS_TOKEN_BLACKLIST + token;
        }
    }


    /**
     * 새로운 로그인 처리
     * - 기존 사용자 로그아웃
     * - 새로운 Refresh Token 저장
     */
    public boolean handleNewLogin(Long userId, String refreshToken, String accessToken, long expirationTime) {
        try {
            boolean existingSession = hasExistingSession(userId);

            if (existingSession) {
                // 기존 Access Token 조회 후 블랙리스트 추가
                String oldAccessToken = redisTemplate.opsForValue().get(RedisKeys.accessToken(userId));
                if (oldAccessToken != null) {
                    addToBlacklist(oldAccessToken);
                    redisTemplate.delete(RedisKeys.accessToken(userId));

                    log.info("기존 Access Token 블랙리스트 추가 완료 - User ID: {}", userId);
                }

                // 기존 Refresh Token 삭제
                redisTemplate.delete(RedisKeys.refreshToken(userId));
                log.info("기존 Refresh Token 삭제 완료 - User ID: {}", userId);
            }

            // 새 토큰 저장
            saveRefreshToken(userId, refreshToken, expirationTime);
            saveAccessToken(userId, accessToken, expirationTime);
            log.info("새로운 로그인 처리 완료 - User ID: {}", userId);

            return existingSession;

        } catch (Exception e) {
            log.error("새로운 로그인 처리 실패 - User ID: {}", userId, e);
            throw new GlobalException(AuthErrorCode.SERVER_ERROR, "로그인 처리에 실패했습니다");
        }
    }



    private boolean hasExistingSession(Long userId) {
        String key = RedisKeys.refreshToken(userId);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Refresh Token을 Redis에 저장
     */
    public void saveRefreshToken(Long userId, String refreshToken, long expirationTime) {
        try {
            String key = RedisKeys.refreshToken(userId);
            redisTemplate.opsForValue().set(
                key,
                refreshToken,
                expirationTime,
                TimeUnit.MILLISECONDS
            );
            log.info("Refresh Token 저장 완료 - User ID: {}", userId);
        } catch (Exception e) {
            log.error("Redis에 Refresh Token 저장 실패 - User ID: {}", userId, e);
            throw new GlobalException(AuthErrorCode.SERVER_ERROR, "토큰 저장에 실패했습니다");
        }
    }

    /**
     * Access Token을 Redis에 저장
     */
    public void saveAccessToken(Long userId, String accessToken, long expirationTime) {
        try {
            String key = RedisKeys.accessToken(userId);
            redisTemplate.opsForValue().set(
                key,
                accessToken,
                expirationTime,
                TimeUnit.MILLISECONDS
            );
            log.info("Access Token 저장 완료 - User ID: {}", userId);
        } catch (Exception e) {
            log.error("Redis에 Access Token 저장 실패 - User ID: {}", userId, e);
            throw new GlobalException(AuthErrorCode.SERVER_ERROR, "토큰 저장에 실패했습니다");
        }
    }

    /**
     * 기존 토큰 무효화
     * - Refresh Token 삭제
     * - 기존 Access Token이 있다면 블랙리스트에 추가
     */
    public void invalidateExistingTokens(Long userId) {
        try {
            String key = RedisKeys.refreshToken(userId);
            String existingRefreshToken = redisTemplate.opsForValue().get(key);

            if (existingRefreshToken != null) {
                // Refresh Token 삭제
                redisTemplate.delete(key);
                log.info("기존 Refresh Token 삭제 완료 - User ID: {}", userId);
            }
        } catch (Exception e) {
            log.error("기존 토큰 무효화 실패 - User ID: {}", userId, e);
            throw new GlobalException(AuthErrorCode.SERVER_ERROR, "토큰 무효화에 실패했습니다");
        }
    }

    /**
     * Access Token을 블랙리스트에 추가
     */
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
                log.info("Access Token 블랙리스트 추가 완료");
            }
        } catch (Exception e) {
            log.error("Redis에 Access Token 블랙리스트 추가 실패", e);
            throw new GlobalException(AuthErrorCode.SERVER_ERROR, "토큰 블랙리스트 추가에 실패했습니다");
        }
    }

    /**
     * Access Token이 블랙리스트에 있는지 확인
     */
    public boolean isBlacklisted(String accessToken) {
        try {
            String key = RedisKeys.blacklist(accessToken);
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("Redis에서 블랙리스트 체크 실패", e);
            return false;
        }
    }

    /**
     * Refresh Token 유효성 검증
     */
    public boolean validateRefreshToken(Long userId, String refreshToken) {
        try {
            String key = RedisKeys.refreshToken(userId);
            String storedToken = redisTemplate.opsForValue().get(key);
            boolean isValid = refreshToken.equals(storedToken);

            if (!isValid) {
                log.warn("Refresh Token 불일치 - User ID: {}", userId);
            }

            return isValid;
        } catch (Exception e) {
            log.error("Redis에서 Refresh Token 검증 실패 - User ID: {}", userId, e);
            return false;
        }
    }

    /**
     * 토큰의 종합적인 유효성 검증
     */
    public boolean validateAndCheckBlacklist(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            log.debug("토큰 기본 검증 실패");
            return false;
        }

        if (isBlacklisted(token)) {
            log.debug("블랙리스트에 존재하는 토큰");
            return false;
        }

        return true;
    }

    /**
     * Access Token 재발급 시 토큰 업데이트
     * - 기존 Access Token 삭제
     * - 새로운 Access Token 저장
     */
    public void updateAccessToken(Long userId, String newAccessToken, long expirationTime) {
        try {
            // 기존 Access Token 삭제
            redisTemplate.delete(RedisKeys.accessToken(userId));

            // 새로운 Access Token 저장
            saveAccessToken(userId, newAccessToken, expirationTime);

            log.info("Access Token 업데이트 완료 - User ID: {}", userId);
        } catch (Exception e) {
            log.error("Access Token 업데이트 실패 - User ID: {}", userId, e);
            throw new GlobalException(AuthErrorCode.SERVER_ERROR, "토큰 업데이트에 실패했습니다");
        }
    }

    /**
     * 로그아웃 처리
     * - Refresh Token 삭제
     * - Access Token 삭제
     * - Access Token 블랙리스트 추가
     */
    public void logout(Long userId, String accessToken) {
        try {
            // Access Token 관련 정리
            redisTemplate.delete(RedisKeys.accessToken(userId));
            addToBlacklist(accessToken);
            log.info("로그아웃 - Access Token 처리 완료 - User ID: {}", userId);

            // Refresh Token 삭제
            redisTemplate.delete(RedisKeys.refreshToken(userId));
            log.info("로그아웃 - Refresh Token 삭제 완료 - User ID: {}", userId);
        } catch (Exception e) {
            log.error("로그아웃 처리 중 오류 발생 - User ID: {}", userId, e);
            throw new GlobalException(AuthErrorCode.LOGOUT_FAILED, "로그아웃 처리에 실패했습니다");
        }
    }
}