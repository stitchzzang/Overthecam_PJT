package com.overthecam.vote.repository;

import com.overthecam.vote.domain.VoteOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VoteOptionRepository extends JpaRepository<VoteOption, Long> {
    void deleteByVote_VoteId(Long voteId);

    @Query("SELECT COUNT(vr) FROM VoteRecord vr WHERE vr.voteOption.voteOptionId = :optionId")
    Long getVoteCount(@Param("optionId") Long optionId);

    // 투표 전체 count (투표 참여자 수 계산용)
    @Query("SELECT COUNT(vr) FROM VoteRecord vr WHERE vr.vote.voteId = :voteId")
    Long getTotalVoteCount(@Param("voteId") Long voteId);

    // 투표 수 증가를 위한 메서드
    @Modifying
    @Query("UPDATE VoteOption o SET o.voteCount = o.voteCount + 1 WHERE o.voteOptionId = :optionId")
    void incrementVoteCount(@Param("optionId") Long optionId);

    // 실시간 데이터 조회를 위한 메서드
    @Query("SELECT o FROM VoteOption o WHERE o.voteOptionId = :optionId")
    VoteOption findByIdWithFreshData(@Param("optionId") Long optionId);

    // 연령대 분포 쿼리
    @Query(nativeQuery = true,
            value = "SELECT vo.vote_option_id, " +
                    "CASE " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 20 THEN '10대' " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 30 THEN '20대' " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 40 THEN '30대' " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 50 THEN '40대' " +
                    "  WHEN YEAR(NOW()) - YEAR(u.birth) < 60 THEN '50대' " +
                    "  ELSE '60대 이상' " +
                    "END AS age_group, " +
                    "COUNT(*) as count " +
                    "FROM vote_option vo " +
                    "LEFT JOIN vote_record vr ON vo.vote_option_id = vr.vote_option_id " +
                    "LEFT JOIN user u ON vr.user_id = u.user_id " +
                    "WHERE vo.vote_id = :voteId " +
                    "GROUP BY vo.vote_option_id, age_group")
    List<Object[]> getAgeDistributionByOption(@Param("voteId") Long voteId);

    // 성별 분포 쿼리
    @Query(nativeQuery = true,
            value = "SELECT vo.vote_option_id, " +
                    "CASE u.gender WHEN 1 THEN '남성' ELSE '여성' END AS gender, " +
                    "COUNT(*) as count " +
                    "FROM vote_option vo " +
                    "LEFT JOIN vote_record vr ON vo.vote_option_id = vr.vote_option_id " +
                    "LEFT JOIN user u ON vr.user_id = u.user_id " +
                    "WHERE vo.vote_id = :voteId " +
                    "GROUP BY vo.vote_option_id, u.gender")
    List<Object[]> getGenderDistributionByOption(@Param("voteId") Long voteId);

}