package com.overthecam.battle.service;

import com.overthecam.auth.domain.User;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.domain.VoteOption;
import com.overthecam.vote.domain.VoteRecord;
import com.overthecam.vote.exception.VoteErrorCode;
import com.overthecam.vote.repository.VoteOptionRepository;
import com.overthecam.vote.repository.VoteRecordRepository;
import com.overthecam.vote.repository.VoteRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class VoteRecordService {
    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteRecordRepository voteRecordRepository;

    public void saveVoteRecords(List<BattleBettingInfo> votes) {
        List<VoteRecord> voteRecords = votes.stream()
            .map(this::createVoteRecord)
            .collect(Collectors.toList());

        voteRecordRepository.saveAll(voteRecords);
    }

    private VoteRecord createVoteRecord(BattleBettingInfo voteInfo) {
        User user = User.builder().id(voteInfo.getUserId()).build();
        VoteOption voteOption = voteOptionRepository.findById(voteInfo.getVoteOptionId())
            .orElseThrow(() -> new GlobalException(VoteErrorCode.VOTE_OPTION_NOT_FOUND, "투표 옵션을 찾을 수 없습니다"));

        Vote voteEntity = voteRepository.findByBattleId(voteInfo.getBattleId())
            .orElseThrow(() -> new GlobalException(VoteErrorCode.VOTE_NOT_FOUND, "투표 정보를 찾을 수 없습니다"));

        return VoteRecord.builder()
            .user(user)
            .vote(voteEntity)
            .voteOption(voteOption)
            .build();
    }
}