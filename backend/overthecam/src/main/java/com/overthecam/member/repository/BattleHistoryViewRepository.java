package com.overthecam.member.repository;

import com.overthecam.member.domain.BattleHistoryView;
import com.overthecam.member.dto.BattleStatsInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleHistoryViewRepository extends JpaRepository<BattleHistoryView, Long> {

    // 사용자의 전적 조회
    List<BattleHistoryView> findByUserId(Long userId);

    // 페이지네이션 메서드 추가
    Page<BattleHistoryView> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);


    @Query("SELECT new com.overthecam.member.dto.BattleStatsInfo(" +
            "b.userId, COUNT(*), " +
            "SUM(CASE WHEN b.isWinner = true AND b.earnedScore >= 0 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN b.isWinner = false AND b.earnedScore < 0 THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN b.isWinner = false AND b.earnedScore >= 0 THEN 1 ELSE 0 END)) " +
            "FROM BattleHistoryView b WHERE b.userId = :userId GROUP BY b.userId")
    BattleStatsInfo findBattleStatsByUserId(@Param("userId") Long userId);
}
