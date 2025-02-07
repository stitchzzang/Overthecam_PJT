package com.overthecam.vote.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.exception.ErrorCode;
import com.overthecam.exception.GlobalException;
import com.overthecam.exception.vote.VoteErrorCode;
import com.overthecam.exception.vote.VoteException;
import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.domain.VoteComment;
import com.overthecam.vote.domain.VoteOption;
import com.overthecam.vote.domain.VoteRecord;
import com.overthecam.vote.dto.VoteCommentDto;
import com.overthecam.vote.dto.VoteRequestDto;
import com.overthecam.vote.dto.VoteResponseDto;
import com.overthecam.vote.repository.VoteCommentRepository;
import com.overthecam.vote.repository.VoteOptionRepository;
import com.overthecam.vote.repository.VoteRecordRepository;
import com.overthecam.vote.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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


    /**
     * 투표 생성 메서드
     * requestDto 투표 생성 요청 정보
     * userId 투표 생성 요청자 ID
     *
     * @return 생성된 투표 정보
     */
    @Transactional
    public VoteResponseDto createVote(VoteRequestDto requestDto, Long userId) {
        // 1. 투표 생성 요청자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        // 2. 투표 옵션 개수 검증 (2개여야 함)
        if (requestDto.getOptions().size() < 2) {
            throw new VoteException(VoteErrorCode.INVALID_VOTE_OPTIONS, "투표 옵션은 2개 입니다.");
        }

        // 3. 종료일 유효성 검증
        if (requestDto.getEndDate().isBefore(LocalDateTime.now())) {
            throw new VoteException(VoteErrorCode.INVALID_END_DATE, "종료일은 현재 이후의 날짜여야 합니다");
        }

        // 4. 투표 엔티티 생성
        Vote vote = Vote.builder()
                .user(user)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .endDate(requestDto.getEndDate())
                .battleId(requestDto.getBattleId())
                .build();

        // 5. 투표 옵션 추가
        requestDto.getOptions().forEach(optionTitle -> {
            VoteOption option = VoteOption.builder()
                    .optionTitle(optionTitle)
                    .build();
            vote.addOption(option);
        });

        // 6. 저장 및 응답
        return convertToResponseDto(voteRepository.save(vote));
    }


    /**
     * 투표 목록을 조회 메서드
     * keyword 검색 키워드
     * sortBy 정렬 기준
     * pageable 페이징 정보
     *
     * @return 페이징된 투표 목록
     */
    public Page<VoteResponseDto> getVotes(String keyword, String sortBy, Pageable pageable) {
        Page<Vote> votes;
        Pageable sortedPageable = getSortedPageable(sortBy, pageable);

        // 1. 키워드가 있는 경우 검색 처리
        if (StringUtils.hasText(keyword)) {
            try {
                // Battle ID로 검색 시도
                Long battleId = Long.parseLong(keyword);
                votes = voteRepository.searchByKeywordAndBattleId(null, battleId, sortedPageable);
            } catch (NumberFormatException e) {
                // 일반 키워드 검색
                votes = voteRepository.searchByKeywordAndBattleId(keyword, null, sortedPageable);
            }
        } else {
            // 2. 정렬 기준에 따른 조회
            votes = getVotesBySort(sortBy, sortedPageable);
        }

        // 3. Entity -> DTO 변환 후 반환
        return votes.map(this::convertToResponseDto);
    }

    /**
     * 투표의 상세 정보를 조회하는 메서드
     * voteId 조회할 투표 ID
     *
     * @return 투표 상세 정보
     */
    private Pageable getSortedPageable(String sortBy, Pageable pageable) {
        switch (sortBy) {
            case "endDate":
                return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                        Sort.by("endDate").ascending());
            case "popularity":
            case "voteCount":
                return pageable; // 특별 정렬은 쿼리에서 처리
            default:
                return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                        Sort.by("createdAt").descending());
        }
    }

    private Page<Vote> getVotesBySort(String sortBy, Pageable pageable) {
        // 인기순
        if ("popularity".equals(sortBy) || "voteCount".equals(sortBy)) {
            return voteRepository.findAllOrderByVoteCountDesc(pageable);
        }
        // 기본정렬
        return voteRepository.findAll(pageable);
    }

    public VoteResponseDto getVoteDetail(Long voteId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));

        // 옵션별 상세 통계 조회
        List<Object[]> ageStats = voteOptionRepository.getAgeDistributionByOption(voteId);
        List<Object[]> genderStats = voteOptionRepository.getGenderDistributionByOption(voteId);

        // 옵션별 통계 데이터 매핑
        Map<Long, Map<String, Double>> optionAgeStats = processOptionStats(ageStats);
        Map<Long, Map<String, Double>> optionGenderStats = processOptionStats(genderStats);

        // 전체 투표 수 계산
        int totalVotes = vote.getOptions().stream()
                .mapToInt(VoteOption::getVoteCount)
                .sum();

        // 옵션 정보 변환
        List<VoteResponseDto.VoteOptionDetailDto> optionDetails = vote.getOptions().stream()
                .map(option -> {
                    Map<String, Double> ageDistribution = optionAgeStats.getOrDefault(option.getVoteOptionId(), new HashMap<>());
                    Map<String, Double> genderDistribution = optionGenderStats.getOrDefault(option.getVoteOptionId(), new HashMap<>());

                    double percentage = totalVotes > 0 ?
                            (double) option.getVoteCount() / totalVotes * 100 : 0;

                    return VoteResponseDto.VoteOptionDetailDto.builder()
                            .optionId(option.getVoteOptionId())
                            .optionTitle(option.getOptionTitle())
                            .voteCount(option.getVoteCount())
                            .votePercentage(Math.round(percentage * 10.0) / 10.0)
                            .ageDistribution(ageDistribution)
                            .genderDistribution(genderDistribution)
                            .build();
                })
                .collect(Collectors.toList());

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
                .createdAt(vote.getCreatedAt())
                .isActive(vote.isActive())
                .options(optionDetails)
                .comments(comments)
                .build();
    }

    private Map<Long, Map<String, Double>> processOptionStats(List<Object[]> stats) {
        Map<Long, Map<String, Double>> result = new HashMap<>();

        for (Object[] row : stats) {
            Long optionId = ((Number) row[0]).longValue();
            String category = (String) row[1];
            Long count = ((Number) row[2]).longValue();

            result.computeIfAbsent(optionId, k -> new HashMap<>())
                    .put(category, count.doubleValue());
        }

        return result;
    }


    /**
     * 투표하는 메서드
     * voteId 참여할 투표 ID
     * optionId 선택한 옵션 ID
     * userId 투표 참여자 ID
     *
     * @return 투표 결과 정보
     */
    @Transactional
    public VoteResponseDto vote(Long voteId, Long optionId, Long userId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));

        // 종료된 투표인지 확인
        if (!vote.isActive() || vote.getEndDate().isBefore(LocalDateTime.now())) {
            throw new VoteException(VoteErrorCode.VOTE_EXPIRED, "종료된 투표입니다");
        }

        // 중복 투표 방지
        if (voteRecordRepository.existsByUser_IdAndVote_VoteId(userId, voteId)) {
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

    /**
     * 투표를 삭제하는 메서드
     */
    @Transactional
    public void deleteVote(Long voteId, Long userId) {
        // 1. 투표 조회
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));

        // 2. 삭제 권한 검증 (투표 생성자만 삭제 가능)
        if (!vote.getUser().getId().equals(userId)) {
            throw new VoteException(VoteErrorCode.UNAUTHORIZED_VOTE_ACCESS, "투표 삭제 권한이 없습니다");
        }

        // 3. 연관된 투표 기록 삭제
        voteRecordRepository.deleteByVote_VoteId(voteId);

        // 4. 투표 삭제
        voteRepository.delete(vote);
    }

    /**
     * 투표에 댓글을 작성하는 메서드
     */
    @Transactional
    public VoteCommentDto createComment(Long voteId, String content, Long userId) {
        // 1. 투표 및 사용자 조회
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        // 2. 댓글 생성 및 저장
        VoteComment comment = VoteComment.builder()
                .vote(vote)
                .user(user)
                .content(content)
                .build();

        return VoteCommentDto.from(voteCommentRepository.save(comment));
    }


    /**
     * 댓글을 수정하는 메서드
     */
    @Transactional
    public VoteCommentDto updateComment(Long commentId, String content, Long userId) {
        // 1. 댓글 조회
        VoteComment comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.COMMENT_NOT_FOUND, "댓글을 찾을 수 없습니다"));

        // 2. 수정 권한 검증
        if (!comment.getUser().getId().equals(userId)) {
            throw new VoteException(VoteErrorCode.UNAUTHORIZED_COMMENT_ACCESS, "댓글 수정 권한이 없습니다");
        }

        // 3. 내용 업데이트 및 응답
        comment.updateContent(content);
        return VoteCommentDto.from(comment);
    }

    /**
     * 댓글을 삭제하는 메서드
     */
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        // 1. 댓글 조회
        VoteComment comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.COMMENT_NOT_FOUND, "댓글을 찾을 수 없습니다"));

        // 2. 삭제 권한 검증
        if (!comment.getUser().getId().equals(userId)) {
            throw new VoteException(VoteErrorCode.UNAUTHORIZED_COMMENT_ACCESS, "댓글 삭제 권한이 없습니다");
        }

        // 3. 댓글 삭제
        voteCommentRepository.delete(comment);
    }


    private VoteResponseDto convertToResponseDto(Vote vote) {
        List<VoteResponseDto.VoteOptionDetailDto> optionDtos = calculateVoteOptions(vote);

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

    private List<VoteResponseDto.VoteOptionDetailDto> calculateVoteOptions(Vote vote) {
        int totalVotes = vote.getOptions().stream()
                .mapToInt(VoteOption::getVoteCount)
                .sum();

        return vote.getOptions().stream()
                .map(option -> {
                    double percentage = totalVotes > 0
                            ? (double) option.getVoteCount() / totalVotes * 100
                            : 0;
                    return VoteResponseDto.VoteOptionDetailDto.builder()
                            .optionId(option.getVoteOptionId())
                            .optionTitle(option.getOptionTitle())
                            .voteCount(option.getVoteCount())
                            .votePercentage(Math.round(percentage * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());
    }


    /**
     * 스케줄러: 만료된 투표를 자동으로 비활성화하는 메서드
     * 매시 정각마다 실행
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkAndCloseExpiredVotes() {
        // 1. 만료된 활성 투표 조회
        List<Vote> expiredVotes = voteRepository.findAllByEndDateBeforeAndIsActiveTrue(LocalDateTime.now());

        // 2. 투표 비활성화
        expiredVotes.forEach(Vote::setInactive);
    }
}