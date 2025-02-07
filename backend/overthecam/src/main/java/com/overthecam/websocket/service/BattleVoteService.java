package com.overthecam.websocket.service;

import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.repository.VoteRepository;
import com.overthecam.websocket.dto.VoteInfo;
import com.overthecam.websocket.dto.VoteInfo.VoteOptionInfo;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BattleVoteService {
    private final VoteRepository voteRepository;

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
