package com.overthecam.battle.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BettingRecord;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.battle.dto.BattleResultResponse;
import com.overthecam.battle.dto.BattleResultResponse.WinningInfo;
import com.overthecam.battle.dto.BattleResultResponse.OptionResult;
import com.overthecam.battle.dto.BattleResultResponse.UserResult;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.battle.repository.BattleVoteRedisRepository;
import com.overthecam.battle.repository.BettingRecordRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.vote.domain.VoteOption;
import com.overthecam.vote.domain.VoteRecord;
import com.overthecam.vote.exception.VoteErrorCode;
import com.overthecam.vote.repository.VoteOptionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.overthecam.member.service.UserScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BattleResultService {
    private final BattleVoteRedisRepository battleVoteRedisRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final UserRepository userRepository;
    private final BattleRepository battleRepository;
    private final BettingRecordRepository bettingRecordRepository;


    private final BattleSettlementService battleSettlementService;
    private final BattleScoreRedisService battleScoreRedisService;
    private final UserScoreService userScoreService;
    private final VoteRecordService voteRecordService;

    public BattleResultResponse finalizeBattleVotes(Long battleId) {
        try {
            List<BattleBettingInfo> votes = battleVoteRedisRepository.getAllVotesForBattle(battleId);
            Map<Long, Integer> optionScores = battleVoteRedisRepository.getOptionScores(battleId);

            Battle battle = battleRepository.findById(battleId)
                    .orElseThrow(() -> new GlobalException(BattleErrorCode.BATTLE_NOT_FOUND, "배틀을 찾을 수 없습니다"));

            // 실제 DB에서 응원점수 차감 처리
            deductFinalScores(votes);

            // 정산 처리
            Map<Long, Integer> rewardResults = battleSettlementService.settleBattleRewards(battleId, optionScores, votes);

            // 투표 기록 및 배팅 기록 저장
            saveRecords(votes, rewardResults);

            // Redis 데이터 정리
            battleScoreRedisService.releaseLockedScores(battleId);
            battleVoteRedisRepository.deleteBattleVotes(battleId);

            return createBattleResult(battle, votes, optionScores, rewardResults);
        } catch (Exception e) {
            // 오류 발생시 Redis 록 해제
            battleScoreRedisService.releaseLockedScores(battleId);
            throw e;
        }
    }

    private void saveRecords(List<BattleBettingInfo> votes, Map<Long, Integer> rewardResults) {
        // 1. 먼저 VoteRecord 저장
        Map<Long, VoteRecord> voteRecords = voteRecordService.saveVoteRecords(votes);

        // 2. BettingRecord 저장
        List<BettingRecord> bettingRecords = votes.stream()
                .map(vote -> {
                    VoteRecord voteRecord = voteRecords.get(vote.getUserId());
                    int earnedScore = rewardResults.getOrDefault(vote.getUserId(), 0);

                    return BettingRecord.builder()
                            .voteRecord(voteRecord)
                            .bettingScore(vote.getSupportScore())
                            .earnedScore(earnedScore)
                            .createdAt(LocalDateTime.now())
                            .build();
                })
                .collect(Collectors.toList());

        bettingRecordRepository.saveAll(bettingRecords);
    }

    private void deductFinalScores(List<BattleBettingInfo> votes) {
        votes.forEach(vote ->
                userScoreService.updateSupportScore(vote.getUserId(), vote.getSupportScore())
        );
    }

    private BattleResultResponse createBattleResult(Battle battle, List<BattleBettingInfo> votes,
                                                    Map<Long, Integer> optionScores, Map<Long, Integer> rewardResults) {
        int totalScore = calculateTotalScore(optionScores);
        Map<Long, Long> voterCountByOption = calculateVoterCountByOption(votes);
        Long winningOptionId = findWinningOptionId(voterCountByOption);
        boolean isDraw = isDrawBattle(voterCountByOption);

        List<OptionResult> optionResults = createOptionResults(optionScores, totalScore, winningOptionId);
        List<UserResult> userResults = createUserResults(votes, winningOptionId, rewardResults);

        WinningInfo winningInfo = WinningInfo.builder()
                .isDraw(isDraw)
                .winningOptionId(isDraw ? null : winningOptionId)
                .totalParticipants(votes.size())
                .totalBettingScore(totalScore)
                .build();

        return BattleResultResponse.builder()
                .battleTitle(battle.getTitle())
                .options(optionResults)
                .userResults(userResults)
                .winningInfo(winningInfo)
                .build();
    }

    private boolean isDrawBattle(Map<Long, Long> voterCountByOption) {
        long maxVoters = voterCountByOption.values().stream()
                .mapToLong(Long::longValue)
                .max()
                .orElse(0);

        return voterCountByOption.values().stream()
                .filter(count -> count == maxVoters)
                .count() > 1;
    }

    private Long findWinningOptionId(Map<Long, Long> voterCountByOption) {
        return voterCountByOption.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElseThrow(() -> new GlobalException(BattleErrorCode.INVALID_VOTE_RESULT, "투표 결과를 처리할 수 없습니다"));
    }

    private int calculateTotalScore(Map<Long, Integer> optionScores) {
        return optionScores.values().stream().mapToInt(Integer::intValue).sum();
    }

    private Map<Long, Long> calculateVoterCountByOption(List<BattleBettingInfo> votes) {
        return votes.stream()
                .collect(Collectors.groupingBy(
                        BattleBettingInfo::getVoteOptionId,
                        Collectors.counting()
                ));
    }

    private List<OptionResult> createOptionResults(Map<Long, Integer> optionScores, int totalScore, Long winningOptionId) {
        return optionScores.entrySet().stream()
                .map(entry -> {
                    VoteOption option = voteOptionRepository.findById(entry.getKey())
                            .orElseThrow(() -> new GlobalException(VoteErrorCode.VOTE_OPTION_NOT_FOUND, "투표 옵션을 찾을 수 없습니다"));

                    return OptionResult.builder()
                            .optionId(option.getVoteOptionId())
                            .optionTitle(option.getOptionTitle())
                            .percentage(calculatePercentage(entry.getValue(), totalScore))
                            .totalScore(entry.getValue())
                            .isWinner(option.getVoteOptionId().equals(winningOptionId))
                            .build();
                })
                .collect(Collectors.toList());
    }


    private List<UserResult> createUserResults(List<BattleBettingInfo> votes, Long winningOptionId,
                                               Map<Long, Integer> rewardResults) {
        return votes.stream()
                .map(vote -> {
                    User user = userRepository.findById(vote.getUserId())
                            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

                    boolean isWinner = vote.getVoteOptionId().equals(winningOptionId);
                    int originalScore = vote.getSupportScore();
                    int resultScore = calculateResultScore(vote.getUserId(), originalScore, isWinner, rewardResults);

                    return UserResult.builder()
                            .userId(user.getId())
                            .nickname(user.getNickname())
                            .isWinner(isWinner)
                            .originalScore(originalScore)
                            .resultScore(resultScore)
                            .selectedOptionId(vote.getVoteOptionId())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private int calculateResultScore(Long userId, int originalScore, boolean isWinner, Map<Long, Integer> rewardResults) {
        if (isWinner) {
            Integer reward = rewardResults.get(userId);
            return reward - originalScore; // 순수 획득 금액 (+ 부호)
        }
        return -originalScore; // 손실 금액 (- 부호)
    }



    private double calculatePercentage(int score, int total) {
        if (total == 0) return 0.0;
        return Math.round((score * 100.0 / total) * 10.0) / 10.0;
    }

    private void updateOptionScores(Map<Long, Integer> optionScores) {
        optionScores.forEach((optionId, totalScore) ->
            voteOptionRepository.findById(optionId)
                .ifPresent(option -> option.updateVoteCount(totalScore))
        );
    }
}
