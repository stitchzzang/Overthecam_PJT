package com.overthecam.vote.repository;
/**
 * 키워드 검색
 * 배틀 ID 필터링
 * 투표 수 기준 정렬
 */

import com.overthecam.vote.domain.Vote;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    // 키워드 및 배틀 ID 복합 검색

    @Query("SELECT v FROM Vote v WHERE " +
            "(:keyword IS NULL OR LOWER(v.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(v.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:battleId IS NULL OR v.battleId = :battleId)")
    Page<Vote> searchByKeywordAndBattleId(
            @Param("keyword") String keyword,
            @Param("battleId") Long battleId,
            Pageable pageable
    );

    // 총 투표 수 기준 정렬
    @Query("SELECT v FROM Vote v " +
            "LEFT JOIN v.options o " +
            "GROUP BY v " +
            "ORDER BY SUM(o.voteCount) DESC NULLS LAST")
    Page<Vote> findAllOrderByVoteCountDesc(Pageable pageable);

    // 만료된 투표 조회
    List<Vote> findAllByEndDateBeforeAndIsActiveTrue(LocalDateTime now);
    Optional<Vote> findByBattleId(Long battleId);
}