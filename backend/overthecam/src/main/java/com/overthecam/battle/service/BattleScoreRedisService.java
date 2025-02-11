package com.overthecam.battle.service;

import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.battle.exception.BattleErrorCode;
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

    public int getTemporaryBattleScore(Long battleId, Long userId) {
        String key = BATTLE_TEMP_SCORE_KEY + battleId;
        Object score = redisTemplate.opsForHash().get(key, userId.toString());
        return score != null ? Integer.parseInt(score.toString()) : 0;
    }

    /**
     * 사용자의 응원점수/포인트 정보 캐싱
     */
    public void cacheUserScore(Long battleId, Long userId, UserScoreInfo userScore) {
        String battleKey = BATTLE_TEMP_SCORE_KEY + battleId;
        String userKey = userId.toString();

        redisTemplate.execute(new SessionCallback<List<Object>>() {
            @Override
            public List<Object> execute(RedisOperations operations) {
                operations.multi();

                // 전체 점수 정보를 Hash에 저장
                operations.opsForHash().put(battleKey, userKey, userScore);

                return operations.exec();
            }
        });
    }

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

    public void updateTemporaryBattleScore(Long battleId, Long userId, int remainingScore) {
        String battleKey = BATTLE_TEMP_SCORE_KEY + battleId;

        // Redis 트랜잭션으로 캐싱된 점수 업데이트
        redisTemplate.execute(new SessionCallback<List<Object>>() {
            @Override
            public List<Object> execute(RedisOperations operations) throws DataAccessException {
                String userKey = userId.toString();

                operations.watch(battleKey);

                // 현재 캐싱된 점수 확인
                Object currentScore = operations.opsForHash().get(battleKey, userKey);
                if (currentScore == null) {
                    throw new GlobalException(BattleErrorCode.NOT_PREPARED, "배틀 준비가 필요합니다");
                }

                operations.multi();

                // 남은 점수로 업데이트
                operations.opsForHash().put(battleKey, userKey, remainingScore);

                return operations.exec();
            }
        });
    }

    /**
     * 캐싱된 사용자 점수 정보 조회
     */
    public UserScoreInfo getCachedUserScore(Long battleId, Long userId) {
        String battleKey = BATTLE_TEMP_SCORE_KEY + battleId;
        Object userScore = redisTemplate.opsForHash().get(battleKey, userId.toString());
        return (UserScoreInfo) userScore;
    }

    /**
     * 응원점수 차감
     */
    public void deductSupportScore(Long battleId, Long userId, int supportScore) {
        String battleKey = BATTLE_TEMP_SCORE_KEY + battleId;
        String userKey = userId.toString();

        redisTemplate.execute(new SessionCallback<List<Object>>() {
            @Override
            public List<Object> execute(RedisOperations operations) {
                operations.watch(battleKey);

                UserScoreInfo currentScore = (UserScoreInfo) operations.opsForHash().get(battleKey, userKey);
                if (currentScore == null) {
                    throw new GlobalException(BattleErrorCode.NOT_PREPARED, "배틀 준비가 필요합니다");
                }

                operations.multi();

                // 응원점수 차감
                UserScoreInfo updatedScore = UserScoreInfo.builder()
                        .supportScore(currentScore.getSupportScore() - supportScore)
                        .point(currentScore.getPoint())
                        .build();

                operations.opsForHash().put(battleKey, userKey, updatedScore);

                return operations.exec();
            }
        });
    }

    public UserScoreInfo deductPoints(Long battleId, Long userId, int points) {
        // DB 포인트 차감
        userScoreService.updatePoints(userId, points);

        String battleKey = BATTLE_TEMP_SCORE_KEY + battleId;
        String userKey = userId.toString();

        return redisTemplate.execute(new SessionCallback<UserScoreInfo>() {
            @Override
            public UserScoreInfo execute(RedisOperations operations) {
                operations.watch(battleKey);

                UserScoreInfo cachedScore = (UserScoreInfo) operations.opsForHash().get(battleKey, userKey);
                if (cachedScore == null) {
                    throw new GlobalException(BattleErrorCode.NOT_PREPARED, "배틀 준비가 필요합니다");
                }

                // 포인트 부족 체크
                if (cachedScore.getPoint() < points) {
                    throw new GlobalException(UserErrorCode.INSUFFICIENT_POINT,
                            String.format("보유한 포인트(%d)가 부족합니다", cachedScore.getPoint()));
                }

                operations.multi();

                // 포인트 차감된 새로운 정보
                UserScoreInfo updatedScore = UserScoreInfo.builder()
                        .supportScore(cachedScore.getSupportScore())
                        .point(cachedScore.getPoint() - points)
                        .build();

                // 캐시 업데이트
                operations.opsForHash().put(battleKey, userKey, updatedScore);

                List<Object> results = operations.exec();
                if (results == null || results.isEmpty()) {
                    throw new GlobalException(RedisErrorCode.TRANSACTION_FAILED, "트랜잭션이 실패했습니다.");
                }

                return updatedScore;
            }
        });
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
            if (score instanceof UserScoreInfo) {
                UserScoreInfo userScore = (UserScoreInfo) score;
                redisTemplate.opsForValue().increment(lockedKey, -userScore.getSupportScore());
            }
        });

        redisTemplate.delete(key);
    }
}