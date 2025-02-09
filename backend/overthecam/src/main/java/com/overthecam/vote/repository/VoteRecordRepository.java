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

    // 연령대별 통계 조회
    @Query(nativeQuery = true,
            value = "SELECT " +
                    "CASE " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 20 THEN '10대' " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 30 THEN '20대' " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 40 THEN '30대' " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 50 THEN '40대' " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 60 THEN '50대' " +
                    "  ELSE '60대 이상' " +
                    "END AS age_group, " +
                    "COUNT(*) AS count " +
                    "FROM vote_record vr " +
                    "JOIN user u ON vr.user_id = u.user_id " +
                    "WHERE vr.vote_id = :voteId " +
                    "GROUP BY age_group")
    List<Object[]> findAgeGroupDistribution(@Param("voteId") Long voteId);

    // 성별 통계 조회
    @Query(nativeQuery = true,
            value = "SELECT " +
                    "CASE u.gender WHEN 1 THEN '남성' ELSE '여성' END AS gender, " +
                    "COUNT(*) AS count " +
                    "FROM vote_record vr " +
                    "JOIN user u ON vr.user_id = u.user_id " +
                    "WHERE vr.vote_id = :voteId " +
                    "GROUP BY gender")
    List<Object[]> findGenderDistribution(@Param("voteId") Long voteId);

    // 투표 삭제 시 기록 삭제
    void deleteByVote_VoteId(Long voteId);

    long countByVoteOption_VoteOptionId(Long voteOptionId);
}