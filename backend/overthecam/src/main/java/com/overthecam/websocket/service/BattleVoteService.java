package com.overthecam.websocket.service;

import com.overthecam.common.exception.GlobalException;
import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.exception.VoteErrorCode;
import com.overthecam.vote.repository.VoteOptionRepository;
import com.overthecam.vote.repository.VoteRepository;
import com.overthecam.websocket.dto.VoteInfo;
import com.overthecam.websocket.dto.VoteInfo.VoteOptionInfo;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BattleVoteService {
    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;

    @Transactional
    public void deleteVote(Long battleId) {
        // 기존 투표 찾기
        Optional<Vote> existingVote = voteRepository.findByBattleId(battleId);

        // 기존 투표가 있다면 삭제
        existingVote.ifPresent(vote -> {
            voteOptionRepository.deleteByVote_VoteId(vote.getVoteId());
            voteRepository.delete(vote);
        });
    }

    // 초기 상태 조회용 - null 허용
    public VoteInfo getCurrentVote(Long battleId) {
        return voteRepository.findByBattleId(battleId)
            .map(vote -> VoteInfo.builder()
                .voteId(vote.getVoteId())
                .title(vote.getTitle())
                .options(convertToVoteOptions(vote))
                .build())
            .orElse(null);
    }

    // 배틀 진행 중 조회용 - 없으면 예외 발생
    public VoteInfo getRequiredVoteInfo(Long battleId) {
        Vote vote = voteRepository.findByBattleId(battleId)
            .orElseThrow(() -> new GlobalException(VoteErrorCode.VOTE_NOT_FOUND, "해당 배틀에 등록된 투표가 존재하지 않습니다."));

        return VoteInfo.builder()
            .voteId(vote.getVoteId())
            .title(vote.getTitle())
            .options(convertToVoteOptions(vote))
            .build();
    }

    private List<VoteOptionInfo> convertToVoteOptions(Vote vote) {
        return vote.getOptions().stream()
            .map(option -> VoteInfo.VoteOptionInfo.builder()
                .optionId(option.getVoteOptionId())
                .optionTitle(option.getOptionTitle())
                .build())
            .collect(Collectors.toList());
    }
}
