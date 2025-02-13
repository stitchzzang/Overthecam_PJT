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
    private final RedisTransactionTemplate transactionTemplate;

    /**
     * 배틀러 투표 처리
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
     * 판정단 투표 + 배팅 처리
     */
    public UserScoreInfo processVoteWithScore(Long battleId, BattleBettingInfo vote) {
        return transactionTemplate.execute(operations -> {
            processVote(battleId, vote);
            return UserScoreInfo.builder()
                .supportScore(vote.getSupportScore())
                .build();
        });
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