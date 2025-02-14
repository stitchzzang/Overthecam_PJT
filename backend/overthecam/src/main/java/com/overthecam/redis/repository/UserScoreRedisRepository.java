package com.overthecam.redis.repository;

import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.redis.util.RedisKeyGenerator;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

/**
 *  저장소: Redis의 점수 관련 CRUD
 */
@Repository
@RequiredArgsConstructor
public class UserScoreRedisRepository {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final long SCORE_EXPIRATION_TIME = 24; // 24 hours

    public void saveUserScore(Long battleId, Long userId, UserScoreInfo score) {
        String key = RedisKeyGenerator.getScoreKey(battleId, userId);
        redisTemplate.opsForValue().set(key, score);
        redisTemplate.expire(key, SCORE_EXPIRATION_TIME, TimeUnit.HOURS);
    }

    public UserScoreInfo getUserScore(Long battleId, Long userId) {
        String key = RedisKeyGenerator.getScoreKey(battleId, userId);
        Object score = redisTemplate.opsForValue().get(key);
        return score != null ? (UserScoreInfo) score : null;
    }

    public void deleteUserScore(Long battleId, Long userId) {
        String key = RedisKeyGenerator.getScoreKey(battleId, userId);
        redisTemplate.delete(key);
    }

    public Map<Long, UserScoreInfo> getAllUserScores(Long battleId) {
        String pattern = RedisKeyGenerator.getScorePattern(battleId);
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys == null || keys.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Object> values = redisTemplate.opsForValue().multiGet(keys);
        Map<Long, UserScoreInfo> result = new HashMap<>();

        int index = 0;
        for (String key : keys) {
            Long userId = extractUserIdFromKey(key);
            Object value = values.get(index++);
            if (value instanceof UserScoreInfo) {
                result.put(userId, (UserScoreInfo) value);
            }
        }

        return result;
    }

    private Long extractUserIdFromKey(String key) {
        String[] parts = key.split(":");
        return Long.valueOf(parts[parts.length - 1]);
    }
}