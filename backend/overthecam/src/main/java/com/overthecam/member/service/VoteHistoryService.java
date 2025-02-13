package com.overthecam.member.service;

import com.overthecam.member.dto.VoteStatsInfo;
import com.overthecam.member.repository.VoteStatsPageResponse;
import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.dto.VoteDetailResponse;
import com.overthecam.vote.repository.VoteRepository;
import com.overthecam.vote.service.VoteStatisticsService;
import com.overthecam.vote.service.VoteValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoteHistoryService {

    private final VoteRepository voteRepository;
    private final VoteStatisticsService voteStatisticsService;
    private final VoteValidationService voteValidationService;

    public VoteStatsPageResponse getMyVotes(Long userId, boolean createdByMe, Pageable pageable) {
        Page<Vote> myVotes;

        if (createdByMe) {
            // 내가 만든 투표만 조회
            myVotes = voteRepository.findByUserId(userId, pageable);
        } else {
            // 전체(만든 투표 + 참여한 투표) 조회
            myVotes = voteRepository.findByUserIdOrVoteRecords(userId, userId, pageable);
        }

        return VoteStatsPageResponse.of(myVotes.map(vote ->
                VoteStatsInfo.of(
                        vote,
                        voteStatisticsService.hasUserVoted(vote.getVoteId(), userId),
                        voteStatisticsService.getSelectionStatus(vote.getVoteId(), userId)
                )
        ));
    }

    /**
     * 투표 상세 조회
     */
    public VoteDetailResponse getVoteDetail(Long voteId, Long userId) {
        Vote vote = voteValidationService.findVoteById(voteId);

        return VoteDetailResponse.ofDetail(
                vote,
                voteStatisticsService.hasUserVoted(vote.getVoteId(), userId),
                Collections.emptyList(),
                voteStatisticsService.getSelectionStatus(vote.getVoteId(), userId),
                voteStatisticsService.getAgeStats(voteId),
                voteStatisticsService.getGenderStats(voteId)
        );
    }
}
