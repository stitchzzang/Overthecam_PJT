package com.overthecam.battle.service;

import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.redis.repository.BattleVoteRedisRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.member.exception.UserErrorCode;
import com.overthecam.member.service.UserScoreService;
import com.overthecam.redis.service.UserScoreRedisService;
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
    private final UserScoreRedisService userScoreRedisService;
    private final UserScoreService userScoreService;


    /**
     * 배틀 준비 - 사용자의 응원점수/포인트 조회 및 캐싱
     */
    public UserScoreInfo prepareBattle(Long battleId, Long userId) {

        // 현재 사용자의 응원점수/포인트 정보 조회 및 캐싱
        UserScoreInfo userScore = userScoreService.getUserScore(userId)
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 응원점수와 포인트를 Redis에 캐싱
        return userScoreRedisService.initializeBattleScore(battleId, userId, userScore);
    }


    /**
     * 배틀러 투표 처리
     */
    public void voteBattler(Long battleId, Long userId, Long optionId) {
        // 투표 및 배틀러 유효성 검증
        validateVote(battleId, optionId, userId);
        ParticipantRole role = validateUserRole(battleId, userId, ParticipantRole.BATTLER);

        // 배틀러는 응원점수 없이 투표 정보만 저장
        saveBettingInfo(battleId, userId, optionId, 0, role);
    }


    /**
     * 일반 판정단 투표 처리
     */
    public UserScoreInfo vote(Long battleId, Long userId, Long optionId, int supportScore) {
        // 투표 및 판정단 유효성 검증
        validateVote(battleId, optionId, userId);
        ParticipantRole role = validateUserRole(battleId, userId, ParticipantRole.PARTICIPANT);

        // 캐싱된 사용자 점수 정보 확인
        UserScoreInfo cachedScore = userScoreRedisService.getTemporaryScore(battleId, userId);
        if (cachedScore == null) {
            throw new GlobalException(BattleErrorCode.NOT_PREPARED, "배틀 준비가 필요합니다");
        }

        // 요청한 응원점수가 사용자가 보유한 점수를 초과하는지 검증
        if (supportScore > cachedScore.getSupportScore()) {
            throw new GlobalException(UserErrorCode.INSUFFICIENT_SCORE,
                    String.format("보유한 응원점수(%d)를 초과하여 투표할 수 없습니다", cachedScore.getSupportScore()));
        }

        // 투표 정보 저장 및 점수 차감
        saveBettingInfo(battleId, userId, optionId, supportScore, role);

        return userScoreRedisService.deductScore(battleId, userId, supportScore);
    }

    /**
     * 포인트로 배틀 시간 구매
     */
    public UserScoreInfo purchaseTime(Long battleId, Long userId, int point){
        return userScoreRedisService.deductPoint(battleId, userId, point);
    }


    private void saveBettingInfo(Long battleId, Long userId, Long optionId, int supportScore, ParticipantRole role) {
        BattleBettingInfo voteInfo = BattleBettingInfo.builder()
            .userId(userId)
            .battleId(battleId)
            .voteOptionId(optionId)
            .supportScore(supportScore)
            .role(role)
            .build();

        battleVoteRedisRepository.saveVote(battleId, voteInfo);
        battleVoteRedisRepository.incrementOptionScore(battleId, optionId, supportScore);
    }

    /**
     * 사용자 역할 검증
     * @param expectedRole 기대하는 역할 (BATTLER or PARTICIPANT)
     */
    public ParticipantRole validateUserRole(Long battleId, Long userId, ParticipantRole expectedRole) {
        ParticipantRole role = battleParticipantRepository.findRoleByBattleIdAndUserId(battleId, userId);

        if (expectedRole == ParticipantRole.BATTLER) {
            if (!ParticipantRole.isBattler(role)) {
                throw new GlobalException(BattleErrorCode.INVALID_ROLE, "배틀러만 참여할 수 있습니다");
            }
        } else if (expectedRole == ParticipantRole.PARTICIPANT) {
            if (ParticipantRole.isBattler(role)) {
                throw new GlobalException(BattleErrorCode.INVALID_BATTLER_VOTE, "배틀러는 투표를 할 수 없습니다");
            }
        }

        return role;
    }


    /**
     * 현재 투표/배팅 현황 조회
     */
    public Map<Long, List<BattleBettingInfo>> getDetailedVoteStatus(Long battleId) {
        List<BattleBettingInfo> votes = battleVoteRedisRepository.getAllVotes(battleId);
        return votes.stream()
            .collect(Collectors.groupingBy(BattleBettingInfo::getVoteOptionId));
    }

    private void validateVote(Long battleId, Long optionId, Long userId) {
        voteValidationService.validateBattle(battleId);
        voteValidationService.findVoteOptionById(optionId);

        if (battleVoteRedisRepository.hasUserVoted(battleId, userId)) {
            throw new GlobalException(VoteErrorCode.DUPLICATE_VOTE, "이미 투표에 참여하셨습니다");
        }
    }
}