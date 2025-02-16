package com.overthecam.vote.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.domain.VoteOption;
import com.overthecam.vote.dto.VoteRequest;
import com.overthecam.vote.exception.VoteErrorCode;
import com.overthecam.vote.repository.VoteOptionRepository;
import com.overthecam.vote.repository.VoteRecordRepository;
import com.overthecam.vote.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoteValidationService {
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteRecordRepository voteRecordRepository;
    private final BattleRepository battleRepository;

    /**
     * 투표 생성 요청 데이터 유효성 검증
     * - 옵션 개수 검증 (최소 2개)
     */
    public void validateVoteRequest(VoteRequest requestDto) {
        if (requestDto.getOptions().size() < 2) {
            throw new GlobalException(VoteErrorCode.INVALID_VOTE_OPTIONS, "투표 옵션은 2개 이상이어야 합니다.");
        }
    }

    /**
     * 투표 소유자 권한 검증
     * - 투표 생성자와 요청 사용자 일치 확인
     */
    public void validateVoteOwnership(Vote vote, Long userId) {
        if (!vote.getUser().getId().equals(userId)) {
            throw new GlobalException(VoteErrorCode.UNAUTHORIZED_VOTE_ACCESS, "투표 삭제 권한이 없습니다");
        }
    }

    /**
     * 투표 유효성 검증
     * - 투표 존재 여부 확인
     * - 투표 활성 상태 확인
     * - 투표 종료 시간 확인
     */
    public Vote findAndValidateVote(Long voteId) {
        Vote vote = findVoteById(voteId);

        if (!vote.isActive()) {
            throw new GlobalException(VoteErrorCode.VOTE_EXPIRED, "비활성화된 투표입니다");
        }

        if (vote.getEndDate().isBefore(LocalDateTime.now())) {
            throw new GlobalException(VoteErrorCode.VOTE_EXPIRED, "종료된 투표입니다");
        }

        return vote;
    }

    /**
     * 중복 투표 검증
     * - 사용자의 동일 투표 참여 여부 확인
     */
    public void validateVoteEligibility(Vote vote, Long userId) {
        if (voteRecordRepository.existsByUser_IdAndVote_VoteId(userId, vote.getVoteId())) {
            throw new GlobalException(VoteErrorCode.DUPLICATE_VOTE, "이미 투표에 참여하셨습니다");
        }
    }

    /**
     * 투표 옵션 유효성 검증
     * - 옵션 존재 여부 확인
     * - 옵션이 해당 투표에 속하는지 확인
     */
    public VoteOption findAndValidateVoteOption(Long voteId, Long optionId) {
        VoteOption option = findVoteOptionById(optionId);

        if (!option.getVote().getVoteId().equals(voteId)) {
            throw new GlobalException(VoteErrorCode.INVALID_VOTE_OPTION, "해당 투표의 옵션이 아닙니다");
        }

        return option;
    }

    /**
     * 사용자 ID로 사용자 조회
     */
    public User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));
    }

    /**
     * 투표 ID로 투표 조회
     */
    public Vote findVoteById(Long voteId) {
        return voteRepository.findById(voteId)
                .orElseThrow(() -> new GlobalException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));
    }

    /**
     * 투표 옵션 ID로 투표 옵션 조회
     */
    public VoteOption findVoteOptionById(Long optionId) {
        return voteOptionRepository.findById(optionId)
                .orElseThrow(() -> new GlobalException(VoteErrorCode.VOTE_OPTION_NOT_FOUND, "투표 옵션을 찾을 수 없습니다"));
    }

    public void validateBattle(Long battleId) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new GlobalException(BattleErrorCode.BATTLE_NOT_FOUND, "배틀을 찾을 수 없습니다"));

//        if (battle.getStatus() != Status.PROGRESS) {
//            throw new GlobalException(BattleErrorCode.INVALID_BATTLE_STATUS, "현재 투표 가능한 상태가 아닙니다");
//        }
    }


}