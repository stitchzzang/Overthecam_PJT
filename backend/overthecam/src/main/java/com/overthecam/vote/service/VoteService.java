package com.overthecam.vote.service;

import com.overthecam.auth.domain.User;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.common.dto.PageInfo;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.domain.VoteOption;
import com.overthecam.vote.domain.VoteRecord;
import com.overthecam.vote.dto.*;
import com.overthecam.vote.dto.VotePageResponse;
import com.overthecam.vote.exception.VoteErrorCode;
import com.overthecam.vote.repository.*;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoteService {
    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteRecordRepository voteRecordRepository;
    private final VoteCommentRepository voteCommentRepository;
    private final BattleRepository battleRepository;
    private final SupportScoreService supportScoreService;
    private final VoteStatisticsService voteStatisticsService;
    private final VoteValidationService voteValidationService;

    /**
     * 투표 생성
     */
    @Transactional
    public VoteResponse createVote(VoteRequest requestDto, Long userId) {
        User user = voteValidationService.findUserById(userId);
        voteValidationService.validateVoteRequest(requestDto);

        Vote vote = createVoteEntity(requestDto, user);
        addOptionsToVote(vote, requestDto.getOptions());

        if(requestDto.getBattleId() != null) {
            supportScoreService.addSupportScore(user, 500);
        }

        Vote savedVote = voteRepository.save(vote);
        return VoteResponse.from(savedVote);
    }

    /**
     * 투표 목록 조회
     */
    public VotePageResponse getVotes(String keyword, String status, Pageable pageable, Long userId) {
        Page<Vote> votes = searchVotesByCondition(keyword, status, pageable);

        // votes를 VoteDetailResponse로 변환하고 페이지 정보 포함
        Page<VoteDetailResponse> votePage = votes.map(vote ->
                VoteDetailResponse.ofList(
                        vote,
                        voteStatisticsService.hasUserVoted(vote.getVoteId(), userId),
                        voteStatisticsService.getSelectionStatus(vote.getVoteId(), userId),
                        voteCommentRepository.countByVote_VoteId(vote.getVoteId())
                )
        );

        return VotePageResponse.builder()
                .content(votePage.getContent())
                .pageInfo(PageInfo.of(votePage))
                .build();
    }

    /**
     * 투표 상세 조회
     */
    public VoteDetailResponse getVoteDetail(Long voteId, Long userId) {
        Vote vote = voteValidationService.findVoteById(voteId);

        return VoteDetailResponse.ofDetail(
                vote,
                voteStatisticsService.hasUserVoted(vote.getVoteId(), userId),
                getVoteComments(vote.getVoteId()),
                voteStatisticsService.getSelectionStatus(vote.getVoteId(), userId),
                voteStatisticsService.getAgeStats(voteId),
                voteStatisticsService.getGenderStats(voteId)
        );
    }

    /**
     * 투표 참여
     */
    @Transactional
    public VoteDetailResponse vote(Long voteId, Long optionId, Long userId) {
        Vote vote = voteValidationService.findAndValidateVote(voteId);
        User user = voteValidationService.findUserById(userId);
        VoteOption option = voteValidationService.findAndValidateVoteOption(voteId, optionId);

        voteValidationService.validateVoteEligibility(vote, userId);

        try {
            VoteRecord voteRecord = createVoteRecord(user, vote, option);
            voteRecordRepository.save(voteRecord);
            voteOptionRepository.incrementVoteCount(optionId);

            supportScoreService.addSupportScore(user, 1000);

            return VoteDetailResponse.ofDetail(
                vote,
                true,
                getVoteComments(vote.getVoteId()),
                voteStatisticsService.getSelectionStatus(vote.getVoteId(), userId),
                voteStatisticsService.getAgeStats(voteId),
                voteStatisticsService.getGenderStats(voteId)
            );
        } catch (Exception e) {
            throw new GlobalException(VoteErrorCode.VOTE_FAILED, "투표 처리 중 오류가 발생했습니다");
        }
    }

    /**
     * 투표 삭제
     */
    @Transactional
    public void deleteVote(Long voteId, Long userId) {
        Vote vote = voteValidationService.findVoteById(voteId);
        voteValidationService.validateVoteOwnership(vote, userId);
        voteCommentRepository.deleteByVote_VoteId(voteId);
        voteRecordRepository.deleteByVote_VoteId(voteId);
        voteOptionRepository.deleteByVote_VoteId(voteId);
        voteRepository.delete(vote);
    }

    // Private helper methods

    private Vote createVoteEntity(VoteRequest requestDto, User user) {
        Vote.VoteBuilder builder = Vote.builder()
            .user(user)
            .title(requestDto.getTitle())
            .content(requestDto.getContent())
            .endDate(LocalDateTime.now().plusDays(7))
            .isActive(true);

        if (requestDto.getBattleId() != null) {
            builder.battle(battleRepository.findById(requestDto.getBattleId()).get());
        }

        return builder.build();
    }

    private void addOptionsToVote(Vote vote, List<String> optionTitles) {
        optionTitles.forEach(optionTitle -> {
            VoteOption option = VoteOption.builder()
                .optionTitle(optionTitle)
                .build();
            vote.addOption(option);
        });
    }

    private Pageable getSortedPageable(String sortBy, Pageable pageable) {
        return switch (sortBy) {
            case "endDate" -> PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by("endDate").ascending()
            );
            case "popularity", "voteCount" -> PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    pageable.getSort()
            );
            default -> PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by("createdAt").descending()
            );
        };
    }

    private Page<Vote> searchVotesByCondition(String keyword, String status, Pageable sortedPageable) {
        Boolean isActive = status == null ? null :
                status.equals("active") ? true :
                        status.equals("ended") ? false : null;

        return voteRepository.findVotesByCondition(isActive, keyword, sortedPageable);
    }

    private Page<Vote> getVotesBySort(String sortBy, Pageable pageable) {
        if ("popularity".equals(sortBy) || "voteCount".equals(sortBy)) {
            return voteRepository.findAllOrderByVoteCountDesc(pageable);
        }
        return voteRepository.findAllNormalVotes(pageable);
    }

    private List<VoteComment> getVoteComments(Long voteId) {
        return voteCommentRepository.findByVote_VoteIdOrderByCreatedAtDesc(voteId)
            .stream()
            .map(VoteComment::from)
            .collect(Collectors.toList());
    }

    private VoteRecord createVoteRecord(User user, Vote vote, VoteOption option) {
        return VoteRecord.builder()
            .user(user)
            .vote(vote)
            .voteOption(option)
            .build();
    }
}