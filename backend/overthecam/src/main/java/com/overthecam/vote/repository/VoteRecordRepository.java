package com.overthecam.vote.repository;

import com.overthecam.vote.domain.VoteRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteRecordRepository extends JpaRepository<VoteRecord, Long> {
    boolean existsByUser_UserIdAndVote_VoteId(Long userId, Long voteId);

    // Native Query 사용 - 가장 효율적인 방법
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

    @Query(nativeQuery = true,
            value = "SELECT " +
                    "CASE u.gender WHEN 1 THEN '남성' ELSE '여성' END AS gender, " +
                    "COUNT(*) AS count " +
                    "FROM vote_record vr " +
                    "JOIN user u ON vr.user_id = u.user_id " +
                    "WHERE vr.vote_id = :voteId " +
                    "GROUP BY gender")
    List<Object[]> findGenderDistribution(@Param("voteId") Long voteId);
}