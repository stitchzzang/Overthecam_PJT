package com.overthecam.redis.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.redis.util.RedisKeyGenerator;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

/**
 * 저장소: Redis의 투표 관련 CRUD
 */
@Repository
@RequiredArgsConstructor
public class BattleVoteRedisRepository {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public void saveVote(Long battleId, BattleBettingInfo vote) {
        String key = RedisKeyGenerator.getVoteKey(battleId);
        redisTemplate.opsForHash().put(key, vote.getUserId().toString(), vote);
    }

    public void incrementOptionScore(Long battleId, Long optionId, int score) {
        String key = RedisKeyGenerator.getVoteKey(battleId) + ":scores";
        redisTemplate.opsForHash().increment(key, optionId.toString(), score);
    }

    public boolean hasUserVoted(Long battleId, Long userId) {
        String key = RedisKeyGenerator.getVoteKey(battleId);
        return redisTemplate.opsForHash().hasKey(key, userId.toString());
    }

    public List<BattleBettingInfo> getAllVotes(Long battleId) {
        String key = RedisKeyGenerator.getVoteKey(battleId);
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);

        return entries.values().stream()
            .map(value -> objectMapper.convertValue(value, BattleBettingInfo.class))
            .collect(Collectors.toList());
    }

    public Map<Long, Integer> getOptionScores(Long battleId) {
        String key = RedisKeyGenerator.getVoteKey(battleId) + ":scores";
        Map<Object, Object> scores = redisTemplate.opsForHash().entries(key);

        return scores.entrySet().stream()
            .collect(Collectors.toMap(
                entry -> Long.valueOf(entry.getKey().toString()),
                entry -> ((Number) entry.getValue()).intValue()
            ));
    }

    public void clearBattleData(Long battleId) {
        String voteKey = RedisKeyGenerator.getVoteKey(battleId);
        String scoresKey = voteKey + ":scores";
        redisTemplate.delete(List.of(voteKey, scoresKey));
    }
}
