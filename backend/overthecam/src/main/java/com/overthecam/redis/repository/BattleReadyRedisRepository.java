package com.overthecam.redis.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.redis.util.RedisKeyGenerator;
import com.overthecam.websocket.dto.BattleReadyUser;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class BattleReadyRedisRepository {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public void markUserReady(Long battleId, Long userId, String nickname) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        String value = userId + ":" + nickname;
        redisTemplate.opsForSet().add(key, value);
    }

    public void cancelUserReady(Long battleId, Long userId) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        Set<String> members = redisTemplate.opsForSet().members(key);
        if (members != null) {
            members.stream()
                .filter(member -> member.startsWith(userId + ":"))
                .forEach(member -> redisTemplate.opsForSet().remove(key, member));
        }
    }

    public boolean isUserReady(Long battleId, Long userId) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        Set<String> members = redisTemplate.opsForSet().members(key);
        return members != null && members.stream()
            .anyMatch(member -> member.startsWith(userId + ":"));
    }

    public Long getReadyCount(Long battleId) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        return redisTemplate.opsForSet().size(key);
    }

    // Ready 유저 목록 조회
    public Set<String> getReadyUsers(Long battleId) {
        String key = RedisKeyGenerator.getReadyKey(battleId);
        Set<String> members = redisTemplate.opsForSet().members(key);
        return members != null ? members : Collections.emptySet();
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