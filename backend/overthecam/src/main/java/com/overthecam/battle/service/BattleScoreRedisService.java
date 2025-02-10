package com.overthecam.battle.service;

import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.battle.exception.RedisErrorCode;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.member.exception.UserErrorCode;
import com.overthecam.member.service.UserScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BattleScoreRedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserScoreService userScoreService;

    private static final String BATTLE_TEMP_SCORE_KEY = "battle:temp:score:";
    private static final String USER_LOCKED_SCORE_KEY = "user:locked:score:";
    private static final String LOCK_KEY_PREFIX = "lock:battle:";

    /**
     * 배틀 참여 시 임시 응원점수 확인 및 락
     */
    public void lockUserScore(Long battleId, Long userId, int score) {
        String lockKey = LOCK_KEY_PREFIX + userId;

        try {
            // 먼저 사용자 점수 정보를 조회
            UserScoreInfo userScore = userScoreService.getUserScore(userId)
                    .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

            // Redis 트랜잭션 실행
            List<Object> results = redisTemplate.execute(new SessionCallback<List<Object>>() {
                @Override
                public List<Object> execute(RedisOperations operations) throws DataAccessException {
                    // watch 설정
                    operations.watch(lockKey);

                    // 현재 잠긴 점수 조회
                    String lockedScoreKey = USER_LOCKED_SCORE_KEY + userId;
                    Object lockedScoreObj = operations.opsForValue().get(lockedScoreKey);
                    int lockedScore = lockedScoreObj != null ? Integer.parseInt(lockedScoreObj.toString()) : 0;

                    // 사용 가능한 점수 확인
                    int availableScore = userScore.getSupportScore() - lockedScore;
                    if (availableScore < score) {
                        throw new GlobalException(UserErrorCode.INSUFFICIENT_SCORE, "응원 점수가 부족합니다.");
                    }

                    // 트랜잭션 시작
                    operations.multi();

                    // 잠긴 점수 증가
                    operations.opsForValue().increment(lockedScoreKey, score);

                    // 임시 배틀 점수 저장
                    String battleKey = BATTLE_TEMP_SCORE_KEY + battleId;
                    operations.opsForHash().put(battleKey, userId.toString(), score);

                    // 트랜잭션 실행
                    return operations.exec();
                }
            });

            // 트랜잭션 실패 확인
            if (results == null || results.isEmpty()) {
                throw new GlobalException(RedisErrorCode.TRANSACTION_FAILED, "트랜잭션이 실패했습니다.");
            }

        } catch (Exception e) {
            log.error("Error in lockUserScore: ", e);
            redisTemplate.unwatch();
            throw e;
        }
    }

    public int getLockedScore(Long userId) {
        String key = USER_LOCKED_SCORE_KEY + userId;
        Object value = redisTemplate.opsForValue().get(key);
        return value != null ? Integer.parseInt(value.toString()) : 0;
    }

    private void incrementLockedScore(Long userId, int score) {
        String key = USER_LOCKED_SCORE_KEY + userId;
        redisTemplate.opsForValue().increment(key, score);
    }

    private void saveTemporaryBattleScore(Long battleId, Long userId, int score) {
        String key = BATTLE_TEMP_SCORE_KEY + battleId;
        redisTemplate.opsForHash().put(key, userId.toString(), score);
    }

    public void releaseLockedScores(Long battleId) {
        String key = BATTLE_TEMP_SCORE_KEY + battleId;
        Map<Object, Object> battleScores = redisTemplate.opsForHash().entries(key);

        battleScores.forEach((userId, score) -> {
            String lockedKey = USER_LOCKED_SCORE_KEY + userId;
            redisTemplate.opsForValue().increment(lockedKey, -Integer.parseInt(score.toString()));
        });

        redisTemplate.delete(key);
    }
}