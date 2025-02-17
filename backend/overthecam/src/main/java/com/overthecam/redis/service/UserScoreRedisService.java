package com.overthecam.redis.service;

import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.member.exception.UserErrorCode;
import com.overthecam.redis.repository.UserScoreRedisRepository;
import com.overthecam.redis.util.RedisTransactionTemplate;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 서비스: 점수 관련 비즈니스 로직 + lock
 */
@Service
@RequiredArgsConstructor
public class UserScoreRedisService {
    private final RedisLockService redisLockService;
    private final UserScoreRedisRepository redisRepository;
    private final RedisTransactionTemplate transactionTemplate;

    /**
     * Redis에 사용자의 응원점수/포인트 정보 캐싱 (락 적용)
     */
    public UserScoreInfo initializeBattleScore(Long battleId, Long userId, UserScoreInfo initialScore) {
        return redisLockService.executeWithLock(userId, () -> {
            redisRepository.saveUserScore(battleId, userId, initialScore);
            return initialScore;
        });
    }

    /**
     * Redis에서 캐시된 사용자 점수 조회
     */
    public UserScoreInfo getTemporaryScore(Long battleId, Long userId) {
        return redisRepository.getUserScore(battleId, userId);
    }

    /**
     * 응원점수 차감 (락 + 트랜잭션 적용)
     */
    public UserScoreInfo deductScore(Long battleId, Long userId, int scoreToDeduct) {
        return redisLockService.executeWithLock(userId, () ->
            transactionTemplate.execute(operations -> {
                UserScoreInfo currentScore = redisRepository.getUserScore(battleId, userId);

                if (currentScore.getSupportScore() < scoreToDeduct) {
                    throw new GlobalException(UserErrorCode.INSUFFICIENT_SCORE, "응원점수가 부족합니다");
                }

                UserScoreInfo updatedScore = UserScoreInfo.builder()
                    .supportScore(currentScore.getSupportScore() - scoreToDeduct)
                    .point(currentScore.getPoint())
                    .build();

                redisRepository.saveUserScore(battleId, userId, updatedScore);
                return updatedScore;
            }));
    }

    /**
     * 포인트 차감 (락 + 트랜잭션 적용)
     */
    public UserScoreInfo deductPoint(Long battleId, Long userId, int point) {
        return redisLockService.executeWithLock(userId, () ->
            transactionTemplate.execute(operations -> {
                UserScoreInfo currentScore = redisRepository.getUserScore(battleId, userId);

                if (currentScore.getPoint() < point) {
                    throw new GlobalException(UserErrorCode.INSUFFICIENT_POINT, "포인트가 부족합니다");
                }

                UserScoreInfo updatedScore = UserScoreInfo.builder()
                    .supportScore(currentScore.getSupportScore())
                    .point(currentScore.getPoint() - point)
                    .build();

                redisRepository.saveUserScore(battleId, userId, updatedScore);
                return updatedScore;
            }));
    }

    /**
     * 배틀 종료 시 점수 정리
     */
    public void clearBattleScores(Long battleId) {
        Map<Long, UserScoreInfo> allScores = redisRepository.getAllUserScores(battleId);
        allScores.keySet().forEach(userId ->
            redisRepository.deleteUserScore(battleId, userId));
    }
}