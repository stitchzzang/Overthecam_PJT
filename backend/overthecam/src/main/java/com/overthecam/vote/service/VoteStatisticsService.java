package com.overthecam.vote.service;

import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.repository.VoteRecordRepository;
import com.overthecam.vote.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoteStatisticsService {
    private final VoteRecordRepository voteRecordRepository;
    private final VoteRepository voteRepository;

    /**
     * 사용자의 투표 여부 확인
     */
    public boolean hasUserVoted(Long voteId, Long userId) {
        Map<Long, Boolean> selectionStatus = getSelectionStatus(voteId, userId);
        return selectionStatus.values().stream().anyMatch(Boolean::booleanValue);
    }

    /**
     * 투표 옵션별 선택 상태 조회
     */
    public Map<Long, Boolean> getSelectionStatus(Long voteId, Long userId) {
        return voteRecordRepository
            .findVoteOptionsWithSelectionStatus(voteId, userId)
            .stream()
            .collect(Collectors.toMap(
                m -> ((Number) m.get("optionId")).longValue(),
                m -> (Boolean) m.get("isSelected")
            ));
    }

    /**
     * 연령대별 투표 통계 조회
     */
    public Map<Long, Map<String, Double>> getAgeStats(Long voteId) {
        Vote vote = voteRepository.findById(voteId).orElseThrow();
        return processOptionStats(
            voteRecordRepository.getAgeDistributionByOption(voteId),
            vote,
            StatsType.AGE
        );
    }

    /**
     * 성별 투표 통계 조회
     */
    public Map<Long, Map<String, Double>> getGenderStats(Long voteId) {
        Vote vote = voteRepository.findById(voteId).orElseThrow();
        return processOptionStats(
            voteRecordRepository.getGenderDistributionByOption(voteId),
            vote,
            StatsType.GENDER
        );
    }

    /**
     * 통계 데이터 처리
     */
    private Map<Long, Map<String, Double>> processOptionStats(List<Object[]> stats, Vote vote, StatsType type) {
        Map<Long, Map<String, Double>> result = new HashMap<>();

        // 기본 카테고리 설정
        List<String> categories = (type == StatsType.AGE)
            ? Arrays.asList("10대", "20대", "30대", "40대", "50대 이상")
            : Arrays.asList("남성", "여성");

        // 모든 옵션에 대해 기본값 초기화
        vote.getOptions().forEach(option -> {
            Map<String, Double> categoryMap = new HashMap<>();
            categories.forEach(category -> categoryMap.put(category, 0.0));
            result.put(option.getVoteOptionId(), categoryMap);
        });

        if (stats == null || stats.isEmpty()) {
            return result;
        }

        // 옵션별 총 투표수 계산
        Map<Long, Integer> totalVotesByOption = new HashMap<>();
        for (Object[] row : stats) {
            Long optionId = ((Number) row[0]).longValue();
            Long count = ((Number) row[2]).longValue();
            totalVotesByOption.merge(optionId, count.intValue(), Integer::sum);
        }

        // 백분율 계산 및 결과 맵에 저장
        for (Object[] row : stats) {
            Long optionId = ((Number) row[0]).longValue();
            String category = (String) row[1];
            Long count = ((Number) row[2]).longValue();

            int totalVotes = totalVotesByOption.get(optionId);
            double percentage = (totalVotes > 0)
                ? Math.round((count.doubleValue() / totalVotes) * 1000.0) / 10.0
                : 0.0;

            result.get(optionId).put(category, percentage);
        }

        return result;
    }

    /**
     * 통계 타입 구분을 위한 enum
     */
    private enum StatsType {
        AGE, GENDER
    }
}