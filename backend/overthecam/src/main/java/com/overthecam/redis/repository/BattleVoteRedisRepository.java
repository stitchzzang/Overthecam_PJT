package com.overthecam.redis.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.battle.dto.BattleBettingInfo;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class BattleVoteRedisRepository {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String BATTLE_VOTE_KEY = "battle:vote:";
    private static final String BATTLE_TOTAL_KEY = "battle:total:";
    private static final String BATTLE_RESULT_KEY = "battle:result:";

    // 배틀의 특정 옵션에 대한 총 응원점수 저장/조회
    public void incrementOptionScore(Long battleId, Long optionId, int score) {
        String key = BATTLE_TOTAL_KEY + battleId;
        redisTemplate.opsForHash().increment(key, optionId.toString(), score);
    }

    // 사용자의 투표 정보 저장
    public void saveUserVote(BattleBettingInfo voteInfo) {
        String key = BATTLE_VOTE_KEY + voteInfo.getBattleId();
        redisTemplate.opsForHash().put(key, voteInfo.getUserId().toString(), voteInfo);
    }

    // 사용자의 투표 여부 확인
    public boolean hasUserVoted(Long battleId, Long userId) {
        String key = BATTLE_VOTE_KEY + battleId;
        return redisTemplate.opsForHash().hasKey(key, userId.toString());
    }

    // 배틀의 모든 투표 정보 조회
    public List<BattleBettingInfo> getAllVotesForBattle(Long battleId) {
        String key = BATTLE_VOTE_KEY + battleId;
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);
        return entries.values().stream()
            .map(value -> objectMapper.convertValue(value, BattleBettingInfo.class))
            .collect(Collectors.toList());
    }

    // 배틀의 옵션별 총 응원점수 조회
    public Map<Long, Integer> getOptionScores(Long battleId) {
        String key = BATTLE_TOTAL_KEY + battleId;
        Map<Object, Object> scores = redisTemplate.opsForHash().entries(key);
        Map<Long, Integer> result = new HashMap<>();
        scores.forEach((k, v) -> result.put(Long.valueOf(k.toString()), ((Number) v).intValue()));
        return result;
    }

    // 배틀 결과 저장 (승리한 옵션, 개별 사용자 승패 여부)
    public void saveBattleResult(Long battleId, Long winnerOption, Map<Long, String> userResults) {
        String key = BATTLE_RESULT_KEY + battleId;
        redisTemplate.opsForHash().put(key, "winner_option", winnerOption.toString());
        userResults.forEach((userId, result) -> redisTemplate.opsForHash().put(key, userId.toString(), result));
    }

    // 배틀 결과 조회
    public Map<String, String> getBattleResult(Long battleId) {
        String key = BATTLE_RESULT_KEY + battleId;
        Map<Object, Object> results = redisTemplate.opsForHash().entries(key);
        return results.entrySet().stream()
            .collect(Collectors.toMap(e -> e.getKey().toString(), e -> e.getValue().toString()));
    }

    // 배틀 투표 정보 삭제
    public void deleteBattleVotes(Long battleId) {
        redisTemplate.delete(Arrays.asList(BATTLE_VOTE_KEY + battleId, BATTLE_TOTAL_KEY + battleId, BATTLE_RESULT_KEY + battleId));
    }

    // 데이터 만료 시간 설정 (필요한 경우)
    public void setExpiration(Long battleId, long timeout, TimeUnit unit) {
        redisTemplate.expire(BATTLE_VOTE_KEY + battleId, timeout, unit);
        redisTemplate.expire(BATTLE_TOTAL_KEY + battleId, timeout, unit);
        redisTemplate.expire(BATTLE_RESULT_KEY + battleId, timeout, unit);
    }
}
