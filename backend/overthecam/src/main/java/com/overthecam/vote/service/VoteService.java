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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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

@Slf4j
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

    @Autowired
    private EntityManager entityManager;  // JPA 엔티티 관리자

// 1. 투표 생성 관련 메서드
    /**
     * 투표 생성 메서드
     * requestDto 투표 생성 요청 정보
     * userId 투표 생성 요청자 ID
     *
     * @return 생성된 투표 정보
     */
    @Transactional
    public VoteResponseDto createVote(VoteRequestDto requestDto, Long userId) {
        // 사용자 조회 및 검증
        User user = findUserById(userId);

        // 투표 요청 데이터 유효성 검증
        validateVoteRequest(requestDto);

        // 투표 엔티티 생성 및 옵션 추가
        Vote vote = createVoteEntity(requestDto, user);
        addOptionsToVote(vote, requestDto.getOptions());

        // 사용자 응원 점수 적립
        supportScoreService.addSupportScore(user, 500);

        // 투표 저장 및 응답 DTO 변환
        return convertToResponseDto(voteRepository.save(vote));
    }

    /**
     * 투표 생성 요청 데이터 유효성 검증
     * - 옵션 개수 검증
     * - 종료 일시 검증
     */
    private void validateVoteRequest(VoteRequestDto requestDto) {
        if (requestDto.getOptions().size() < 2) {
            throw new VoteException(VoteErrorCode.INVALID_VOTE_OPTIONS, "투표 옵션은 2개 입니다.");
        }

        if (requestDto.getEndDate().isBefore(LocalDateTime.now())) {
            throw new VoteException(VoteErrorCode.INVALID_END_DATE, "종료일은 현재 이후의 날짜여야 합니다");
        }
    }

    /**
     * 투표 엔티티 생성
     */
    private Vote createVoteEntity(VoteRequestDto requestDto, User user) {
        return Vote.builder()
                .user(user)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .endDate(requestDto.getEndDate())
                .battleId(requestDto.getBattleId())
                .build();
    }

    /**
     * 투표에 옵션 추가
     * - 옵션 제목으로 VoteOption 생성
     * - Vote 엔티티에 옵션 연결
     */
    private void addOptionsToVote(Vote vote, List<String> optionTitles) {
        optionTitles.forEach(optionTitle -> {
            VoteOption option = VoteOption.builder()
                    .optionTitle(optionTitle)
                    .build();
            vote.addOption(option);
        });
    }

// 2. 투표 목록 조회 메서드
    /**
     * 투표 목록을 조회 메서드
     * keyword 검색 키워드
     * sortBy 정렬 기준
     * pageable 페이징 정보
     *
     * @return 페이징된 투표 목록
     */
    public VotePageResponse getVotes(String keyword, String sortBy, Pageable pageable) {
        // 정렬 및 페이징 처리
        Pageable sortedPageable = getSortedPageable(sortBy, pageable);

        // 키워드/정렬 기준에 따른 투표 조회
        Page<Vote> votes = searchVotesByCondition(keyword, sortBy, sortedPageable);

        // 투표 목록을 응답 DTO로 변환
        Page<VoteResponseDto> voteDtos = votes.map(this::mapVoteToResponseDto);

        return VotePageResponse.of(voteDtos);
    }

    /**
     * 투표의 상세 정보를 조회하는 메서드
     * voteId 조회할 투표 ID
     *
     * @return 투표 상세 정보
     */
    private Pageable getSortedPageable(String sortBy, Pageable pageable) {
        return switch (sortBy) {
            case "endDate" -> PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by("endDate").ascending()
            );
            case "popularity", "voteCount" -> pageable;
            default -> PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by("createdAt").descending()
            );
        };
    }

    /**
     * 키워드 및 정렬 조건에 따른 투표 검색
     * - 키워드가 숫자(배틀ID)인 경우
     * - 키워드가 문자열(제목/내용)인 경우
     * - 정렬 기준에 따른 조회
     */
    private Page<Vote> searchVotesByCondition(String keyword, String sortBy, Pageable sortedPageable) {
        if (StringUtils.hasText(keyword)) {
            try {
                Long battleId = Long.parseLong(keyword);
                return voteRepository.searchByKeywordAndBattleId(null, battleId, sortedPageable);
            } catch (NumberFormatException e) {
                return voteRepository.searchByKeywordAndBattleId(keyword, null, sortedPageable);
            }
        } else {
            return getVotesBySort(sortBy, sortedPageable);
        }
    }

    /**
     * 정렬 기준에 따른 투표 조회
     * - 투표 수 기준 정렬
     * - 기본 전체 조회
     */
    private Page<Vote> getVotesBySort(String sortBy, Pageable pageable) {
        if ("popularity".equals(sortBy) || "voteCount".equals(sortBy)) {
            return voteRepository.findAllOrderByVoteCountDesc(pageable);
        }
        return voteRepository.findAll(pageable);
    }

    public VoteResponseDto getVoteDetail(Long voteId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));

    /**
     * 투표 엔티티를 응답 DTO로 변환
     * - 투표 통계 정보 계산
     * - 댓글 수 조회
     */
    private VoteResponseDto mapVoteToResponseDto(Vote vote) {
        int totalVotes = calculateTotalVotes(vote);
        long commentCount = voteCommentRepository.countByVote_VoteId(vote.getVoteId());

        return VoteResponseDto.builder()
                .voteId(vote.getVoteId())
                .battleId(vote.getBattleId())
                .title(vote.getTitle())
                .content(vote.getContent())
                .creatorNickname(vote.getUser().getNickname())
                .endDate(vote.getEndDate())
                .createdAt(vote.getCreatedAt())
                .isActive(vote.isActive())
                .options(createSimpleOptionDtos(vote, totalVotes))
                .commentCount(commentCount)
                .comments(null)
                .build();
    }

// 3. 투표 상세 조회 메서드
    /**
     * 투표 상세 조회
     * - 투표 기본 정보
     * - 연령/성별 통계
     * - 댓글 정보와 댓글 수
     */
    public VoteResponseDto getVoteDetail(Long voteId) {
        // 투표 조회
        Vote vote = findVoteById(voteId);

        // 투표 통계 정보 처리
        Map<Long, Map<String, Double>> optionAgeStats = processOptionStats(
                voteOptionRepository.getAgeDistributionByOption(voteId)
        );
        Map<Long, Map<String, Double>> optionGenderStats = processOptionStats(
                voteOptionRepository.getGenderDistributionByOption(voteId)
        );

        // 댓글 수 조회
        long commentCount = voteCommentRepository.countByVote_VoteId(vote.getVoteId());

        // 투표 상세 정보 구성
        return VoteResponseDto.builder()
                .voteId(vote.getVoteId())
                .battleId(vote.getBattleId())
                .title(vote.getTitle())
                .content(vote.getContent())
                .creatorNickname(vote.getUser().getNickname())
                .endDate(vote.getEndDate())
                .createdAt(vote.getCreatedAt())
                .isActive(vote.isActive())
                .options(createOptionDetailDtos(
                        vote,
                        calculateTotalVotes(vote),
                        optionAgeStats,
                        optionGenderStats
                ))
                .commentCount(commentCount)
                .comments(getVoteComments(vote.getVoteId()))
                .build();
    }

// 4. 투표 참여 메서드
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
        // 투표, 사용자, 옵션 조회 및 검증
        Vote vote = findAndValidateVote(voteId);
        User user = findUserById(userId);
        VoteOption option = findVoteOptionById(optionId);

        // 중복 투표 검증
        validateVoteEligibility(vote, userId);

        try {
            // 투표 기록 저장 및 통계 갱신
            VoteRecord voteRecord = createVoteRecord(user, vote, option);
            voteRecordRepository.save(voteRecord);
            voteOptionRepository.incrementVoteCount(optionId);

            // 사용자 응원 점수 적립
            supportScoreService.addSupportScore(user, 100);

            // 엔티티 상태 동기화
            syncEntityState(vote);

            return convertToResponseDto(vote);
        } catch (Exception e) {
            throw new VoteException(VoteErrorCode.VOTE_FAILED, "투표 처리 중 오류가 발생했습니다");
        }
    }

// 5. 투표 삭제 메서드
    @Transactional
    public void deleteVote(Long voteId, Long userId) {
        // 투표 조회 및 권한 검증
        Vote vote = findVoteById(voteId);
        validateVoteOwnership(vote, userId);

        // 관련 레코드 삭제
        voteRecordRepository.deleteByVote_VoteId(voteId);
        voteOptionRepository.deleteByVote_VoteId(voteId);

        // 투표 삭제
        voteRepository.delete(vote);
    }

// 6. 유틸리티 및 보조 메서드
    /**
     * 투표 소유자 권한 검증
     * - 투표 생성자와 요청 사용자 일치 확인
     */
    private void validateVoteOwnership(Vote vote, Long userId) {
        if (!vote.getUser().getUserId().equals(userId)) {
            throw new VoteException(VoteErrorCode.UNAUTHORIZED_VOTE_ACCESS, "투표 삭제 권한이 없습니다");
        }
    }

    /**
     * 투표 및 옵션 유효성 검증
     * - 투표 활성 상태 확인
     * - 투표 종료 시간 확인
     */
    private Vote findAndValidateVote(Long voteId) {
        Vote vote = findVoteById(voteId);

        if (!vote.isActive() || vote.getEndDate().isBefore(LocalDateTime.now())) {
            throw new VoteException(VoteErrorCode.VOTE_EXPIRED, "종료된 투표입니다");
        }

        // 중복 투표 방지
        if (voteRecordRepository.existsByUser_IdAndVote_VoteId(userId, voteId)) {
            throw new VoteException(VoteErrorCode.DUPLICATE_VOTE, "이미 투표했습니다");
        }
    }

// 7. 기타 메서드들
    /**
     * 투표 통계 정보 처리
     * - 옵션별 통계 데이터 변환
     */
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
     * 만료된 투표 자동 비활성화
     * - 매 시간 0분에 실행되는 스케줄링 작업
     * - 현재 시간 이전에 종료된 활성 투표 비활성화
     */
    @Scheduled(cron = "0 0 * * * *")
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
     * 투표 응답 DTO 변환
     * - 투표 엔티티를 응답 DTO로 변환
     * - 총 투표 수와 댓글 수 계산
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
        int totalVotes = calculateTotalVotes(vote);
        long commentCount = voteCommentRepository.countByVote_VoteId(vote.getVoteId());

        return VoteResponseDto.builder()
                .voteId(vote.getVoteId())
                .battleId(vote.getBattleId())
                .title(vote.getTitle())
                .content(vote.getContent())
                .creatorNickname(vote.getUser().getNickname())
                .endDate(vote.getEndDate())
                .createdAt(vote.getCreatedAt())
                .isActive(vote.isActive())
                .options(createSimpleOptionDtos(vote, totalVotes))
                .commentCount(commentCount)
                .comments(null)
                .build();
    }

    /**
     * 간단한 투표 옵션 DTO 생성
     * - 각 옵션의 투표 수와 비율 계산
     */
    private List<VoteResponseDto.VoteOptionDetailDto> createSimpleOptionDtos(Vote vote, int totalVotes) {
        return vote.getOptions().stream()
                .map(option -> {
                    double percentage = totalVotes > 0 ?
                            (double) option.getVoteCount() / totalVotes * 100 : 0;
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
     * 상세 투표 옵션 DTO 생성
     * - 연령대/성별 분포 포함
     */
    private List<VoteResponseDto.VoteOptionDetailDto> createOptionDetailDtos(
            Vote vote,
            int totalVotes,
            Map<Long, Map<String, Double>> ageStats,
            Map<Long, Map<String, Double>> genderStats) {
        return vote.getOptions().stream()
                .map(option -> {
                    double percentage = totalVotes > 0 ?
                            (double) option.getVoteCount() / totalVotes * 100 : 0;
                    return VoteResponseDto.VoteOptionDetailDto.builder()
                            .optionId(option.getVoteOptionId())
                            .optionTitle(option.getOptionTitle())
                            .voteCount(option.getVoteCount())
                            .votePercentage(Math.round(percentage * 10.0) / 10.0)
                            .ageDistribution(ageStats.getOrDefault(option.getVoteOptionId(), new HashMap<>()))
                            .genderDistribution(genderStats.getOrDefault(option.getVoteOptionId(), new HashMap<>()))
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 총 투표 수 계산
     * - 모든 옵션의 투표 수 합산
     */
    private int calculateTotalVotes(Vote vote) {
        return vote.getOptions().stream()
                .mapToInt(VoteOption::getVoteCount)
                .sum();
    }

    /**
     * 투표 댓글 조회
     * - 특정 투표의 최신 댓글 목록 조회
     */
    private List<VoteCommentDto> getVoteComments(Long voteId) {
        return voteCommentRepository.findByVote_VoteIdOrderByCreatedAtDesc(voteId)
                .stream()
                .map(VoteCommentDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 투표 레코드 생성
     * - 사용자, 투표, 선택 옵션으로 VoteRecord 생성
     */
    private VoteRecord createVoteRecord(User user, Vote vote, VoteOption option) {
        return VoteRecord.builder()
                .user(user)
                .vote(vote)
                .voteOption(option)
                .build();
    }

    /**
     * 엔티티 상태 동기화
     * - 엔티티 상태 새로고침
     */
    private void syncEntityState(Vote vote) {
        entityManager.flush();
        entityManager.refresh(vote);
    }

    /**
     * 사용자 ID로 사용자 조회
     * - 존재하지 않는 경우 예외 발생
     */
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));
    }

    /**
     * 투표 옵션 ID로 투표 옵션 조회
     * - 존재하지 않는 경우 예외 발생
     */
    private VoteOption findVoteOptionById(Long optionId) {
        return voteOptionRepository.findById(optionId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_OPTION_NOT_FOUND, "투표 옵션을 찾을 수 없습니다"));
    }
    /**
     * 투표 ID로 투표 조회
     * - 존재하지 않는 경우 예외 발생
     */
    private Vote findVoteById(Long voteId) {
        return voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));
    }
}