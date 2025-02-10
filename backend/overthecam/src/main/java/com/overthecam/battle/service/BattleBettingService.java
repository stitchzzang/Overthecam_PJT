package com.overthecam.battle.service;

import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleVoteRedisRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.vote.exception.VoteErrorCode;
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
    private final BattleParticipantRepository battleParticipantRepository;
    private final BattleVoteRedisRepository battleVoteRedisRepository;
    private final VoteValidationService voteValidationService;
    private final BattleScoreRedisService battleScoreRedisService;

    /**
     * 배틀 투표 처리
     */
    public void vote(Long battleId, Long userId, Long optionId, int supportScore) {
        // 투표 유효성 검증
        voteValidationService.validateBattle(battleId);
        voteValidationService.findVoteOptionById(optionId);
        validateNoDuplicateVote(battleId, userId);
        validateUserRole(battleId, userId);


        // 응원점수 임시 락
        battleScoreRedisService.lockUserScore(battleId, userId, supportScore);

        // 투표 정보 저장
        saveBettingInfo(battleId, userId, optionId, supportScore);
    }

    private void saveBettingInfo(Long battleId, Long userId, Long optionId, int supportScore) {
        BattleBettingInfo voteInfo = BattleBettingInfo.builder()
            .userId(userId)
            .battleId(battleId)
            .voteOptionId(optionId)
            .supportScore(supportScore)
            .build();

        battleVoteRedisRepository.saveUserVote(voteInfo);
        battleVoteRedisRepository.incrementOptionScore(battleId, optionId, supportScore);
    }

    public void validateUserRole(Long battleId, Long userId){
        int role = battleParticipantRepository.findRoleByBattleIdAndUserId(battleId, userId);

        if(ParticipantRole.isBattler(role)){
            throw new GlobalException(BattleErrorCode.INVALID_BATTLER_VOTE, "배틀러는 투표를 할 수 없습니다");
        }
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
     * 모든 사용자 배팅 정보
     */
    public Map<Long, List<BattleBettingInfo>> getDetailedVoteStatus(Long battleId) {
        List<BattleBettingInfo> votes = battleVoteRedisRepository.getAllVotesForBattle(battleId);
        return votes.stream()
            .collect(Collectors.groupingBy(BattleBettingInfo::getVoteOptionId));
    }

    private void validateNoDuplicateVote(Long battleId, Long userId) {
        if (battleVoteRedisRepository.hasUserVoted(battleId, userId)) {
            throw new GlobalException(VoteErrorCode.DUPLICATE_VOTE, "이미 투표에 참여하셨습니다");
        }
    }
}