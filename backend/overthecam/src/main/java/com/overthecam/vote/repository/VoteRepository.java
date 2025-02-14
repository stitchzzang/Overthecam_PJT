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

    // 키워드 검색
    @Query("SELECT v FROM Vote v " +
            "JOIN v.user u " +
            "WHERE v.battle IS NULL AND " +
            "(:keyword IS NULL OR " +
            "LOWER(v.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(v.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Vote> searchByKeyword(
            @Param("keyword") String keyword,
            Pageable pageable
    );

    // 총 투표 수 기준 정렬
    @Query("SELECT v FROM Vote v " +
        "LEFT JOIN v.options o " +
        "WHERE v.battle IS NULL " +  // 추가
        "GROUP BY v " +
        "ORDER BY SUM(o.voteCount) DESC NULLS LAST")
    Page<Vote> findAllOrderByVoteCountDesc(Pageable pageable);

    // 일반 투표 전체 조회
    @Query("SELECT v FROM Vote v WHERE v.battle IS NULL")
    Page<Vote> findAllNormalVotes(Pageable pageable);

    // 만료된 투표 조회 (일반 투표만)
    @Query("SELECT v FROM Vote v WHERE " +
        "v.battle IS NULL AND " +
        "v.endDate < :now AND v.isActive = true")
    List<Vote> findAllByEndDateBeforeAndIsActiveTrue(@Param("now") LocalDateTime now);

    @Query("SELECT DISTINCT v FROM Vote v " +
            "LEFT JOIN VoteRecord vr ON v = vr.vote " +
            "WHERE v.user.id = :userId " +
            "OR vr.user.id = :participantId " +
            "ORDER BY v.createdAt DESC")
    Page<Vote> findByUserIdOrVoteRecords(
            @Param("userId") Long userId,
            @Param("participantId") Long participantId,
            Pageable pageable
    );

    Optional<Vote> findByBattleId(Long battleId);

    @Query("SELECT v FROM Vote v WHERE v.user.id = :userId ORDER BY v.createdAt DESC")
    Page<Vote> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // isActive 상태로 필터링하여 조회
    @Query("SELECT DISTINCT v FROM Vote v " +
            "LEFT JOIN FETCH v.user u " +
            "WHERE v.battle IS NULL " +
            "AND (:isActive IS NULL OR v.isActive = :isActive) " +
            "AND (:keyword IS NULL OR " +
            "   LOWER(v.title) LIKE %:keyword% OR " +
            "   LOWER(v.content) LIKE %:keyword% OR " +
            "   LOWER(u.nickname) LIKE %:keyword%) " +
            "ORDER BY CASE WHEN v.isActive = true THEN 0 ELSE 1 END, v.createdAt DESC")
    Page<Vote> findVotesByCondition(
            @Param("isActive") Boolean isActive,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}