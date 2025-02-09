package com.overthecam.battle.service;

import com.overthecam.auth.domain.User;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.battle.repository.BattleVoteRedisRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.vote.domain.VoteOption;
import com.overthecam.vote.domain.VoteRecord;
import com.overthecam.vote.exception.VoteErrorCode;
import com.overthecam.vote.repository.VoteOptionRepository;
import com.overthecam.vote.repository.VoteRecordRepository;
import com.overthecam.vote.service.SupportScoreService;
import com.overthecam.vote.service.VoteValidationService;
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
public class BattleBettingService {
    private final BattleVoteRedisRepository battleVoteRedisRepository;
    private final VoteValidationService voteValidationService;
    private final SupportScoreService supportScoreService;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteRecordRepository voteRecordRepository;

    /**
     * 배틀 투표 처리
     */
    public void vote(Long battleId, Long userId, Long optionId, int supportScore) {
        // 사용자 및 투표 옵션 검증
        User user = voteValidationService.findUserById(userId);
        VoteOption voteOption = voteValidationService.findVoteOptionById(optionId);

        // 중복 투표 검증
        if (battleVoteRedisRepository.hasUserVoted(battleId, userId)) {
            throw new GlobalException(VoteErrorCode.DUPLICATE_VOTE, "이미 투표에 참여하셨습니다");
        }

        // 응원점수 차감
        supportScoreService.deductSupportScore(user, supportScore);

        // Redis에 투표 정보 저장
        BattleBettingInfo voteInfo = BattleBettingInfo.builder()
            .userId(userId)
            .battleId(battleId)
            .voteOptionId(optionId)
            .supportScore(supportScore)
            .build();

        battleVoteRedisRepository.saveUserVote(voteInfo);
        battleVoteRedisRepository.incrementOptionScore(battleId, optionId, supportScore);
    }

    /**
     * 배틀 종료 시 투표 결과 DB 반영
     */
    @Transactional
    public void finalizeBattleVotes(Long battleId) {
        List<BattleBettingInfo> votes = battleVoteRedisRepository.getAllVotesForBattle(battleId);
        Map<Long, Integer> optionScores = battleVoteRedisRepository.getOptionScores(battleId);

        // 옵션별 점수 업데이트 & 투표 기록 저장
        List<VoteRecord> voteRecords = votes.stream()
            .map(vote -> VoteRecord.builder()
                .user(User.userIdBuilder().id(vote.getUserId()).build())
                .voteOption(voteOptionRepository.findById(vote.getVoteOptionId())
                    .orElseThrow(() -> new GlobalException(VoteErrorCode.VOTE_OPTION_NOT_FOUND, "투표 옵션을 찾을 수 없습니다"))
                ).build()
            ).collect(Collectors.toList());

        voteRecordRepository.saveAll(voteRecords);
        optionScores.forEach((optionId, totalScore) ->
            voteOptionRepository.findById(optionId).ifPresent(option -> option.updateVoteCount(totalScore))
        );

        // Redis 데이터 삭제
        battleVoteRedisRepository.deleteBattleVotes(battleId);
    }


    /**
     * 현재 투표 현황 조회
     */
    public Map<Long, Integer> getCurrentVoteStatus(Long battleId) {
        Map<Long, Integer> status = battleVoteRedisRepository.getOptionScores(battleId);
        log.info("Battle {} current vote status: {}", battleId, status);
        return status;
    }

    /**
     *
     * 모든 사용자 배팅 정보
     */
    public Map<Long, List<BattleBettingInfo>> getDetailedVoteStatus(Long battleId) {
        List<BattleBettingInfo> votes = battleVoteRedisRepository.getAllVotesForBattle(battleId);

        return votes.stream()
            .collect(Collectors.groupingBy(BattleBettingInfo::getVoteOptionId));
    }

}