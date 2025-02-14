package com.overthecam.redis.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.redis.util.RedisKeyGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class BattleReadyRedisRepository {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public void markUserReady(Long battleId, Long userId) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        redisTemplate.opsForSet().add(key, userId.toString());
    }

    public void cancelUserReady(Long battleId, Long userId) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        redisTemplate.opsForSet().remove(key, userId.toString());
    }

    public boolean isUserReady(Long battleId, Long userId) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(key, userId.toString()));
    }

    public Long getReadyCount(Long battleId) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        return redisTemplate.opsForSet().size(key);
    }

    public boolean areAllParticipantsReady(Long battleId, int totalParticipants) {
        Long readyCount = getReadyCount(battleId);
        return readyCount != null && readyCount >= totalParticipants;
    }

    public void clearReadyStatus(Long battleId) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        redisTemplate.delete(key);
    }
}