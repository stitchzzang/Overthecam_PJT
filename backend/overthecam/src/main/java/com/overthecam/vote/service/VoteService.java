package com.overthecam.vote.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.exception.ErrorCode;
import com.overthecam.exception.GlobalException;
import com.overthecam.exception.vote.VoteErrorCode;
import com.overthecam.exception.vote.VoteException;
import com.overthecam.vote.domain.*;
import com.overthecam.vote.dto.*;
import com.overthecam.vote.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoteService {
    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteRecordRepository voteRecordRepository;
    private final VoteCommentRepository voteCommentRepository;
    private final UserRepository userRepository;
    private final SupportScoreService supportScoreService;

    // 1. 투표 생성
    @Transactional
    public VoteResponseDto createVote(VoteRequestDto requestDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        // 투표 옵션 검증
        if (requestDto.getOptions().size() < 2) {
            throw new VoteException(VoteErrorCode.INVALID_VOTE_OPTIONS, "투표 옵션은 최소 2개 이상이어야 합니다");
        }

        // 종료일 검증
        if (requestDto.getEndDate().isBefore(LocalDateTime.now())) {
            throw new VoteException(VoteErrorCode.INVALID_END_DATE, "종료일은 현재 이후의 날짜여야 합니다");
        }

        // 투표 엔티티 생성 및 저장
        Vote vote = Vote.builder()
                .user(user)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .endDate(requestDto.getEndDate())
                .battleId(requestDto.getBattleId()) // battleId 추가
                .build();

        // 투표 옵션 추가
        requestDto.getOptions().forEach(optionTitle -> {
            VoteOption option = VoteOption.builder()
                    .optionTitle(optionTitle)
                    .build();
            vote.addOption(option);
        });

        return convertToResponseDto(voteRepository.save(vote));
    }


    // 2. 투표 목록 조회
    public Page<VoteResponseDto> getVotes(String keyword, String sortBy, Pageable pageable) {
        Page<Vote> votes;

        if ("popularity".equals(sortBy)) {
            // 인기순 정렬 (옵션 투표 수 기준)
            votes = voteRepository.findAllOrderByVoteCountDesc(pageable);
        } else if (StringUtils.hasText(keyword)) {
            // 키워드 검색 (제목 또는 내용)
            votes = voteRepository.findByTitleContainingOrContentContaining(keyword, keyword, pageable);
        } else {
            // 기본 조회 (생성일 기준)
            votes = voteRepository.findAll(pageable);
        }

        return votes.map(this::convertToResponseDto);
    }

    // 3. 투표 검색
    public Page<VoteResponseDto> searchVotes(String keyword, Pageable pageable) {
        return voteRepository.findByTitleContainingOrContentContaining(keyword, keyword, pageable)
                .map(this::convertToResponseDto);
    }

    // 4. 특정 투표 상세 조회 (통계 및 댓글 포함)
    public VoteResponseDto getVoteDetail(Long voteId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));

        List<VoteResponseDto.VoteOptionDto> options = calculateVoteOptions(vote);

        // 통계 데이터 조회
        Map<String, Double> ageGroupStats = convertToStatMap(voteRecordRepository.findAgeGroupDistribution(voteId));
        Map<String, Double> genderStats = convertToStatMap(voteRecordRepository.findGenderDistribution(voteId));

        // 댓글 목록 조회
        List<VoteCommentDto> comments = voteCommentRepository.findByVote_VoteIdOrderByCreatedAtDesc(voteId)
                .stream()
                .map(VoteCommentDto::from)
                .collect(Collectors.toList());

        return VoteResponseDto.builder()
                .voteId(vote.getVoteId())
                .battleId(vote.getBattleId())
                .title(vote.getTitle())
                .content(vote.getContent())
                .creatorNickname(vote.getUser().getNickname())
                .endDate(vote.getEndDate())
                .isActive(vote.isActive())
                .options(options)
                .ageGroupStats(ageGroupStats)
                .genderStats(genderStats)
                .comments(comments)
                .build();
    }

    // 5. 투표 참여
    @Transactional
    public VoteResponseDto vote(Long voteId, Long optionId, Long userId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));

        // 종료된 투표인지 확인
        if (!vote.isActive() || vote.getEndDate().isBefore(LocalDateTime.now())) {
            throw new VoteException(VoteErrorCode.VOTE_EXPIRED, "종료된 투표입니다");
        }

        // 중복 투표 방지
        if (voteRecordRepository.existsByUser_UserIdAndVote_VoteId(userId, voteId)) {
            throw new VoteException(VoteErrorCode.DUPLICATE_VOTE, "이미 투표했습니다");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        try {
            // 응원 점수 차감 (100점)
            supportScoreService.deductSupportScore(user, 100);
        } catch (SupportScoreService.InsufficientSupportScoreException e) {
            throw new VoteException(VoteErrorCode.INSUFFICIENT_SCORE, e.getMessage());
        }

        VoteOption option = voteOptionRepository.findById(optionId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_OPTION_NOT_FOUND, "투표 옵션을 찾을 수 없습니다"));

        // 투표 기록 저장 및 투표 수 증가
        VoteRecord voteRecord = VoteRecord.builder()
                .user(user)
                .vote(vote)
                .voteOption(option)
                .build();
        voteRecordRepository.save(voteRecord);

        option.incrementVoteCount();

        return convertToResponseDto(vote);
    }

    // 6. 투표 삭제
    @Transactional
    public void deleteVote(Long voteId, Long userId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));

        if (!vote.getUser().getUserId().equals(userId)) {
            throw new VoteException(VoteErrorCode.UNAUTHORIZED_VOTE_ACCESS, "투표 삭제 권한이 없습니다");
        }

        voteRepository.delete(vote);
    }

    // 7. 댓글 작성
    @Transactional
    public VoteCommentDto createComment(Long voteId, String content, Long userId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        VoteComment comment = VoteComment.builder()
                .vote(vote)
                .user(user)
                .content(content)
                .build();

        return VoteCommentDto.from(voteCommentRepository.save(comment));
    }

    // 8. 댓글 수정
    @Transactional
    public VoteCommentDto updateComment(Long commentId, String content, Long userId) {
        VoteComment comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.COMMENT_NOT_FOUND, "댓글을 찾을 수 없습니다"));

        if (!comment.getUser().getUserId().equals(userId)) {
            throw new VoteException(VoteErrorCode.UNAUTHORIZED_COMMENT_ACCESS, "댓글 수정 권한이 없습니다");
        }

        comment.updateContent(content);
        return VoteCommentDto.from(comment);
    }

    // 9. 댓글 삭제
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        VoteComment comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.COMMENT_NOT_FOUND, "댓글을 찾을 수 없습니다"));

        if (!comment.getUser().getUserId().equals(userId)) {
            throw new VoteException(VoteErrorCode.UNAUTHORIZED_COMMENT_ACCESS, "댓글 삭제 권한이 없습니다");
        }

        voteCommentRepository.delete(comment);
    }

    // 헬퍼 메서드들
    private Map<String, Double> convertToStatMap(List<Object[]> statsList) {
        return statsList.stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> ((Number) row[1]).doubleValue(),
                        Double::sum
                ));
    }

    private VoteResponseDto convertToResponseDto(Vote vote) {
        List<VoteResponseDto.VoteOptionDto> optionDtos = calculateVoteOptions(vote);

        return VoteResponseDto.builder()
                .voteId(vote.getVoteId())
                .battleId(vote.getBattleId())
                .title(vote.getTitle())
                .content(vote.getContent())
                .creatorNickname(vote.getUser().getNickname())
                .endDate(vote.getEndDate())
                .options(optionDtos)
                .createdAt(vote.getCreatedAt())
                .isActive(vote.isActive())
                .build();
    }

    private List<VoteResponseDto.VoteOptionDto> calculateVoteOptions(Vote vote) {
        int totalVotes = vote.getOptions().stream()
                .mapToInt(VoteOption::getVoteCount)
                .sum();

        return vote.getOptions().stream()
                .map(option -> {
                    double percentage = totalVotes > 0
                            ? (double) option.getVoteCount() / totalVotes * 100
                            : 0;
                    return VoteResponseDto.VoteOptionDto.builder()
                            .optionId(option.getVoteOptionId())
                            .optionTitle(option.getOptionTitle())
                            .voteCount(option.getVoteCount())
                            .votePercentage(Math.round(percentage * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 스케줄러
    @Scheduled(cron = "0 0 * * * *")
    public void checkAndCloseExpiredVotes() {
        List<Vote> expiredVotes = voteRepository.findAllByEndDateBeforeAndIsActiveTrue(LocalDateTime.now());
        expiredVotes.forEach(Vote::setInactive);
    }
}