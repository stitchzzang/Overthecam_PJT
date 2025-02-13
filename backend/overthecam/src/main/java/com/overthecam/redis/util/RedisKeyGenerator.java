package com.overthecam.redis.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class RedisKeyGenerator {

    private static final String BATTLE_VOTE = "battle:vote:";     // 투표 정보
    private static final String BATTLE_TOTAL = "battle:total:";   // 총 투표수
    private static final String BATTLE_RESULT = "battle:result:"; // 배틀 결과
    private static final String USER_LOCK = "lock:user:";         // 유저 락
    private static final String USER_SCORE = "battle:%d:user:%d"; // 유저 점수

    /**
     * 배틀의 투표 정보를 저장하는 키
     * Format: battle:vote:{battleId}
     */
    public static String getVoteKey(Long battleId) {
        return BATTLE_VOTE + battleId;
    }

    /**
     * 배틀의 총계 정보를 저장하는 키
     * Format: battle:total:{battleId}
     */
    public static String getTotalKey(Long battleId) {
        return BATTLE_TOTAL + battleId;
    }

    /**
     * 배틀의 결과를 저장하는 키
     * Format: battle:result:{battleId}
     */
    public static String getResultKey(Long battleId) {
        return BATTLE_RESULT + battleId;
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
}