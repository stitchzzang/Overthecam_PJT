package com.overthecam.redis.service;

import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.redis.repository.BattleVoteRedisRepository;
import com.overthecam.redis.util.RedisTransactionTemplate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 서비스: 투표/배팅 관련 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
public class BattleVoteRedisService {

    private final BattleVoteRedisRepository voteRedisRepository;
    private final UserScoreRedisService userScoreRedisService;

    private final RedisTransactionTemplate transactionTemplate;

    /**
     * 단순 투표 처리 (투표 정보만 저장)
     */
    public void processVote(Long battleId, BattleBettingInfo vote) {
        transactionTemplate.execute(operations -> {
            voteRedisRepository.saveVote(battleId, vote);
            if (!vote.isBattler()) {
                voteRedisRepository.incrementOptionScore(battleId, vote.getVoteOptionId(), vote.getSupportScore());
            }
            return null;
        });
    }

    /**
     * 투표 + 배팅 처리 (투표 정보 저장 + 업데이트된 점수 반환)
     */
    public UserScoreInfo processVoteWithScore(Long battleId, BattleBettingInfo vote) {
        return transactionTemplate.execute(operations -> {
            // 1. 투표 처리
            voteRedisRepository.saveVote(battleId, vote);
            voteRedisRepository.incrementOptionScore(battleId, vote.getVoteOptionId(), vote.getSupportScore());

            // 2. 점수 차감
            return userScoreRedisService.deductScore(battleId, vote.getUserId(), vote.getSupportScore());
        });
    }

    /**
     * 사용자의 투표 여부 확인
     */
    public boolean hasUserVoted(Long battleId, Long userId) {
        return voteRedisRepository.hasUserVoted(battleId, userId);
    }

    public List<BattleBettingInfo> getAllVotes(Long battleId) {
        return voteRedisRepository.getAllVotes(battleId);
    }

    public Map<Long, Integer> getOptionScores(Long battleId) {
        return voteRedisRepository.getOptionScores(battleId);
    }

    public void clearBattleData(Long battleId) {
        voteRedisRepository.clearBattleData(battleId);
    }
}