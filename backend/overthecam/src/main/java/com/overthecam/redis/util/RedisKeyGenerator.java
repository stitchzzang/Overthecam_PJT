package com.overthecam.redis.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class RedisKeyGenerator {

    private static final String READY_USER = "battle:readyUser:";
    private static final String BATTLE_VOTE = "battle:vote:";     // 투표 정보
    private static final String USER_LOCK = "lock:user:";         // 유저 락
    private static final String USER_SCORE = "battle:%d:user:%d"; // 유저 점수

    // Token 관련 키 prefix
    private static final String REFRESH_TOKEN = "auth:refresh:";    // Refresh Token
    private static final String ACCESS_TOKEN_BLACKLIST = "auth:blacklist:";  // Access Token 블랙리스트
    private static final String USER_TOKEN = "auth:user:%d:token"; // 사용자별 토큰 정보


    /**
     * 배틀 준비된 사용자 ID를 저장하는 키
     * Format: battle:readyUser:{battleId}
     */
    public static String getReadyKey(Long battleId) {
        return READY_USER + battleId;
    }

    /**
     * 배틀의 투표 정보를 저장하는 키
     * Format: battle:vote:{battleId}
     */
    public static String getVoteKey(Long battleId) {
        return BATTLE_VOTE + battleId;
    }


    /**
     * 유저의 락 정보를 저장하는 키
     * Format: lock:user:{userId}
     */
    public static String getLockKey(Long userId) {
        return USER_LOCK + userId;
    }

    /**
     * 유저의 점수를 저장하는 키
     * Format: battle:{battleId}:user:{userId}
     */
    public static String getScoreKey(Long battleId, Long userId) {
        return String.format(USER_SCORE, battleId, userId);
    }

    /**
     * 배틀의 모든 유저 점수를 조회하기 위한 패턴
     */
    public static String getScorePattern(Long battleId) {
        return String.format("battle:%d:user:*", battleId);
    }

    /**
     * Refresh Token을 저장하는 키
     * Format: auth:refresh:{userId}
     */
    public static String getRefreshTokenKey(Long userId) {
        return REFRESH_TOKEN + userId;
    }

    /**
     * Access Token 블랙리스트 키
     * Format: auth:blacklist:{tokenValue}
     */
    public static String getBlacklistKey(String token) {
        return ACCESS_TOKEN_BLACKLIST + token;
    }

    /**
     * 사용자의 토큰 정보를 저장하는 키 (선택적)
     * Format: auth:user:{userId}:token
     * 여러 디바이스 로그인 관리나 토큰 이력 관리시 사용
     */
    public static String getUserTokenKey(Long userId) {
        return String.format(USER_TOKEN, userId);
    }

    /**
     * 특정 사용자의 모든 토큰 관련 키를 조회하는 패턴
     * Format: auth:user:{userId}:*
     */
    public static String getUserTokenPattern(Long userId) {
        return String.format("auth:user:%d:*", userId);
    }
}