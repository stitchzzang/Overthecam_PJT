package com.overthecam.vote.repository;
/**
 * 투표 참여
 * 중복 투표 방지
 * 투표 기록 저장
 * 투표 옵션 카운트증가
 * 투표 통계
 * 연령대별 통계
 * 성별 분포 조회
 */

import com.overthecam.vote.domain.VoteRecord;
import java.util.Map;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteRecordRepository extends JpaRepository<VoteRecord, Long> {
    // 중복 투표 확인
    boolean existsByUser_IdAndVote_VoteId(Long userId, Long voteId);

    // 투표 여부와 선택한 옵션 동시 조회
    @Query("SELECT new map(" +
        "vo.voteOptionId as optionId, " +
        "CASE WHEN vr.voteRecordId IS NOT NULL THEN true ELSE false END as isSelected) " +
        "FROM VoteOption vo " +
        "LEFT JOIN VoteRecord vr ON vr.voteOption = vo " +
        "AND vr.user.id = :userId " +
        "WHERE vo.vote.voteId = :voteId")
    List<Map<String, Object>> findVoteOptionsWithSelectionStatus(
        @Param("voteId") Long voteId,
        @Param("userId") Long userId
    );

    // 연령대별 투표 분포 조회
    @Query("""
        SELECT vr.voteOption.voteOptionId, 
               CASE 
                   WHEN YEAR(CURRENT_DATE) - YEAR(vr.user.birth) < 20 THEN '10대'
                   WHEN YEAR(CURRENT_DATE) - YEAR(vr.user.birth) < 30 THEN '20대'
                   WHEN YEAR(CURRENT_DATE) - YEAR(vr.user.birth) < 40 THEN '30대'
                   WHEN YEAR(CURRENT_DATE) - YEAR(vr.user.birth) < 50 THEN '40대'
                   ELSE '50대 이상'
               END as ageGroup,
               COUNT(*) as count
        FROM VoteRecord vr
        WHERE vr.vote.voteId = :voteId
        GROUP BY vr.voteOption.voteOptionId, ageGroup
        ORDER BY vr.voteOption.voteOptionId, ageGroup
    """)
    List<Object[]> getAgeDistributionByOption(@Param("voteId") Long voteId);

    // 성별 투표 분포 조회
    @Query("""
        SELECT vr.voteOption.voteOptionId,
               CASE 
                   WHEN vr.user.gender = 0 THEN '남성'
                   WHEN vr.user.gender = 1 THEN '여성'
                   ELSE '기타'
               END as genderGroup,
               COUNT(*) as count
        FROM VoteRecord vr
        WHERE vr.vote.voteId = :voteId
        GROUP BY vr.voteOption.voteOptionId, vr.user.gender
        ORDER BY vr.voteOption.voteOptionId, vr.user.gender
    """)
    List<Object[]> getGenderDistributionByOption(@Param("voteId") Long voteId);


    // 투표 삭제 시 기록 삭제
    void deleteByVote_VoteId(Long voteId);

    long countByVoteOption_VoteOptionId(Long voteOptionId);
}