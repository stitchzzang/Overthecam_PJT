package com.overthecam.battle.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.battle.dto.BattleResultResponse;
import com.overthecam.battle.dto.BattleResultResponse.OptionResult;
import com.overthecam.battle.dto.BattleResultResponse.UserResult;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.battle.repository.BattleVoteRedisRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.vote.domain.VoteOption;
import com.overthecam.vote.exception.VoteErrorCode;
import com.overthecam.vote.repository.VoteOptionRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
    private final BattleRepository battleRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final UserRepository userRepository;
    private final VoteRecordService voteRecordService;

    public BattleResultResponse finalizeBattleVotes(Long battleId) {
        List<BattleBettingInfo> votes = battleVoteRedisRepository.getAllVotesForBattle(battleId);
        Map<Long, Integer> optionScores = battleVoteRedisRepository.getOptionScores(battleId);

        Battle battle = battleRepository.findById(battleId)
            .orElseThrow(() -> new GlobalException(BattleErrorCode.BATTLE_NOT_FOUND, "배틀을 찾을 수 없습니다"));

        BattleResultResponse response = createBattleResult(battle, votes, optionScores);

        // Save results to database
        voteRecordService.saveVoteRecords(votes);
        updateOptionScores(optionScores);

        // Clean up Redis data
        battleVoteRedisRepository.deleteBattleVotes(battleId);

        return response;
    }

    private BattleResultResponse createBattleResult(Battle battle, List<BattleBettingInfo> votes, Map<Long, Integer> optionScores) {
        int totalScore = calculateTotalScore(optionScores);
        List<OptionResult> optionResults = createOptionResults(optionScores, totalScore);
        Long winningOptionId = findWinningOptionId(optionScores);
        List<UserResult> userResults = createUserResults(votes, winningOptionId);

        return BattleResultResponse.builder()
            .battleTitle(battle.getTitle())
            .options(optionResults)
            .userResults(userResults)
            .build();
    }

    private int calculateTotalScore(Map<Long, Integer> optionScores) {
        return optionScores.values().stream().mapToInt(Integer::intValue).sum();
    }

    private List<OptionResult> createOptionResults(Map<Long, Integer> optionScores, int totalScore) {
        return optionScores.entrySet().stream()
            .map(entry -> {
                VoteOption option = voteOptionRepository.findById(entry.getKey())
                    .orElseThrow(() -> new GlobalException(VoteErrorCode.VOTE_OPTION_NOT_FOUND, "투표 옵션을 찾을 수 없습니다"));

                return OptionResult.builder()
                    .optionId(option.getVoteOptionId())
                    .optionTitle(option.getOptionTitle())
                    .percentage(calculatePercentage(entry.getValue(), totalScore))
                    .totalScore(entry.getValue())
                    .build();
            })
            .collect(Collectors.toList());
    }

    private Long findWinningOptionId(Map<Long, Integer> optionScores) {
        return optionScores.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElseThrow(() -> new GlobalException(BattleErrorCode.INVALID_VOTE_RESULT, "투표 결과를 처리할 수 없습니다"));
    }

    private List<UserResult> createUserResults(List<BattleBettingInfo> votes, Long winningOptionId) {
        return votes.stream()
            .map(vote -> {
                User user = userRepository.findById(vote.getUserId())
                    .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

                return UserResult.builder()
                    .userId(user.getId())
                    .nickname(user.getNickname())
                    .isWinner(vote.getVoteOptionId().equals(winningOptionId))
                    .supportScore(vote.getSupportScore())
                    .selectedOptionId(vote.getVoteOptionId())
                    .build();
            })
            .collect(Collectors.toList());
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
