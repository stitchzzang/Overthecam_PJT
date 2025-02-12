package com.overthecam.battle.service;

import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.battle.repository.BattleVoteRedisRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.member.exception.UserErrorCode;
import com.overthecam.member.service.UserScoreService;
import com.overthecam.vote.service.VoteValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BattleSettlementService {

    private static final int REWARD_PER_PARTICIPANT = 1000;  // 참여자 1인당 보상 풀 기여금

    private final UserScoreService userScoreService;
    private final VoteValidationService validationService;

    @Transactional
    public Map<Long, Integer> settleBattleRewards(Long battleId, Map<Long, Integer> optionScores,
                                                  List<BattleBettingInfo> votes) {
        try {
            // 1. 배틀 상태 검증
            validationService.validateBattle(battleId);

            // 2. Redis 데이터와 DB 데이터 일관성 검증
            validateDataConsistency(battleId, votes);

            // 3. 승패 판정 및 보상 처리
            Map<Long, Long> voterCountByOption = calculateVoterCountByOption(votes);
            boolean isDraw = isDrawBattle(voterCountByOption);

            Map<Long, Integer> rewardResults = new HashMap<>();

            // 총 응원점수 계산 (배틀러 보상 계산용)
            int totalBattleScore = calculateTotalScore(optionScores);

            if (isDraw) {
                settleDraw(votes, totalBattleScore, rewardResults);
            } else {
                Long winningOptionId = findWinningOptionId(voterCountByOption);
                settleWinLoss(votes, winningOptionId, optionScores, totalBattleScore, rewardResults);
            }


            return rewardResults;

        } catch (Exception e) {
            log.error("Settlement failed for battle {}: {}", battleId, e.getMessage());
            throw new GlobalException(BattleErrorCode.INVALID_VOTE_RESULT, "배팅한 응원 점수 정산에 오류가 발생했습니다.");
        }
    }

    private void settleWinLoss(List<BattleBettingInfo> votes, Long winningOptionId,
                               Map<Long, Integer> optionScores, int totalBattleScore,
                               Map<Long, Integer> rewardResults) {
        int losingTotalScore = calculateLosingTotalScore(optionScores, winningOptionId);
        int winningTotalScore = optionScores.get(winningOptionId);

        votes.forEach(vote -> {
            boolean isWinner = vote.getVoteOptionId().equals(winningOptionId);

            if (vote.isBattler()) {
                // 배틀러 정산: 승리 시 총 응원점수의 2배, 패배 시 0
                int battlerReward = isWinner ? totalBattleScore * 2 : 0;
                if (battlerReward > 0) {
                    userScoreService.updateSupportScore(vote.getUserId(), -battlerReward);
                }
                rewardResults.put(vote.getUserId(), battlerReward);

                log.info("Battler settlement - User: {}, Winner: {}, Reward: {}",
                        vote.getUserId(), isWinner, battlerReward);
            } else {
                // 일반 참여자 정산
                if (isWinner) {
                    int voterReward = calculateWinnerReward(vote.getSupportScore(),
                            losingTotalScore,
                            winningTotalScore,
                            votes.size());
                    userScoreService.updateSupportScore(vote.getUserId(), -voterReward);
                    rewardResults.put(vote.getUserId(), voterReward);

                    log.info("Voter win settlement - User: {}, Original: {}, Reward: {}",
                            vote.getUserId(), vote.getSupportScore(), voterReward);
                } else {
                    // 패배측은 이미 차감된 상태
                    rewardResults.put(vote.getUserId(), 0);
                    log.info("Voter lose settlement - User: {}, Lost: {}",
                            vote.getUserId(), vote.getSupportScore());
                }
            }
        });
    }

    private void settleDraw(List<BattleBettingInfo> votes, int totalBattleScore,
                            Map<Long, Integer> rewardResults) {
        votes.forEach(vote -> {
            if (vote.isBattler()) {
                // 배틀러 무승부: 총 응원점수의 1배
                int battlerReward = totalBattleScore;
                userScoreService.updateSupportScore(vote.getUserId(), -battlerReward);
                rewardResults.put(vote.getUserId(), battlerReward);

                log.info("Battler draw settlement - User: {}, Reward: {}",
                        vote.getUserId(), battlerReward);
            } else {
                // 일반 참여자 무승부: 원금 반환
                int voterRefund = vote.getSupportScore();
                userScoreService.updateSupportScore(vote.getUserId(), -voterRefund);
                rewardResults.put(vote.getUserId(), voterRefund);

                log.info("Voter draw settlement - User: {}, Refunded: {}",
                        vote.getUserId(), voterRefund);
            }
        });
    }

    private int calculateTotalScore(Map<Long, Integer> optionScores) {
        return optionScores.values().stream()
                .mapToInt(Integer::intValue)
                .sum();
    }

    private void validateDataConsistency(Long battleId, List<BattleBettingInfo> votes) {
        // Redis의 투표 데이터와 DB의 사용자 데이터 검증
        votes.forEach(vote -> {
            UserScoreInfo userScore = userScoreService.getUserScore(vote.getUserId())
                    .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

            if (userScore.getSupportScore() < vote.getSupportScore()) {
                throw new GlobalException(UserErrorCode.INSUFFICIENT_SCORE,
                        "사용자의 응원점수가 부족합니다");
            }
        });
    }

    private Map<Long, Long> calculateVoterCountByOption(List<BattleBettingInfo> votes) {
        return votes.stream()
                .collect(Collectors.groupingBy(
                        BattleBettingInfo::getVoteOptionId,
                        Collectors.counting()
                ));
    }

    private Long findWinningOptionId(Map<Long, Long> voterCountByOption) {
        return voterCountByOption.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElseThrow(() -> new GlobalException(BattleErrorCode.INVALID_VOTE_RESULT, "투표 결과를 처리할 수 없습니다"));
    }

    private boolean isDrawBattle(Map<Long, Long> voterCountByOption) {
        // 최다 투표자 수를 받은 옵션이 여러 개인 경우 무승부
        long maxVoters = voterCountByOption.values().stream()
                .mapToLong(Long::longValue)
                .max()
                .orElse(0);

        return voterCountByOption.values().stream()
                .filter(count -> count == maxVoters)
                .count() > 1;
    }

    private Map<Long, Integer> calculateTotalScoresByOption(List<BattleBettingInfo> votes) {
        return votes.stream()
                .collect(Collectors.groupingBy(
                        BattleBettingInfo::getVoteOptionId,
                        Collectors.summingInt(BattleBettingInfo::getSupportScore)
                ));
    }

    private int calculateLosingTotalScore(Map<Long, Integer> totalScoresByOption, Long winningOptionId) {
        return totalScoresByOption.entrySet().stream()
                .filter(entry -> !entry.getKey().equals(winningOptionId))
                .mapToInt(Map.Entry::getValue)
                .sum();
    }

    private int calculateWinnerReward(int userBetScore, int losingTotalScore,
                                                            int winningTotalScore, int totalParticipants) {
        if (winningTotalScore == 0) return 0;

        // 패배팀의 응원점수가 없는 경우 (상대가 배틀러)
        if (losingTotalScore == 0) {

            // 승리자의 보상 = 본인 배팅 응원점수 + (기본 보상 풀 × 본인 배팅 비율)
            int defaultRewardPool = totalParticipants * REWARD_PER_PARTICIPANT;

            double bettingRatio = (double) userBetScore / winningTotalScore;
            int additionalReward = (int) (REWARD_PER_PARTICIPANT * bettingRatio);

            return userBetScore + additionalReward;
        }

        // 승리자의 보상 = 본인 배팅 응원점수 + (패배 진영 총 응원점수 × 본인 배팅 비율)
        double bettingRatio = (double) userBetScore / winningTotalScore;
        int additionalReward = (int) (losingTotalScore * bettingRatio);

        return userBetScore + additionalReward;
    }
}