package com.overthecam.vote.repository;

import com.overthecam.vote.domain.VoteOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VoteOptionRepository extends JpaRepository<VoteOption, Long> {
    // 옵션별 연령대 분포
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
                    "LEFT JOIN user u ON vr.user_id = u.user_id " +  // users -> user로 수정
                    "WHERE vo.vote_id = :voteId " +
                    "GROUP BY vo.vote_option_id, age_group")
    List<Object[]> getAgeDistributionByOption(@Param("voteId") Long voteId);

    // 옵션별 성별 분포
    @Query(nativeQuery = true,
            value = "SELECT vo.vote_option_id, " +
                    "CASE u.gender WHEN 1 THEN '남성' ELSE '여성' END AS gender, " +
                    "COUNT(*) as count " +
                    "FROM vote_option vo " +
                    "LEFT JOIN vote_record vr ON vo.vote_option_id = vr.vote_option_id " +
                    "LEFT JOIN user u ON vr.user_id = u.user_id " +  // users -> user로 수정
                    "WHERE vo.vote_id = :voteId " +
                    "GROUP BY vo.vote_option_id, u.gender")
    List<Object[]> getGenderDistributionByOption(@Param("voteId") Long voteId);
}