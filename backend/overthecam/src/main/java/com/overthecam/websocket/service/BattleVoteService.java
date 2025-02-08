package com.overthecam.websocket.service;

import com.overthecam.vote.domain.Vote;
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
    public void deleteAndCreateNewVote(Long battleId) {
        // 기존 투표 찾기
        Optional<Vote> existingVote = voteRepository.findByBattleId(battleId);

        // 기존 투표가 있다면 삭제
        existingVote.ifPresent(vote -> {
            voteOptionRepository.deleteByVote_VoteId(vote.getVoteId());
            voteRepository.delete(vote);
        });
    }

    public VoteInfo getVoteInfo(Long battleId) {
        Vote vote = voteRepository.findByBattleId(battleId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

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
