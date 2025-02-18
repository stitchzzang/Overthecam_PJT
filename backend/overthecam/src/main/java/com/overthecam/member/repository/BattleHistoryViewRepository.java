package com.overthecam.member.repository;

import com.overthecam.battle.dto.BattleResultDto;
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
    @Query(value = "SELECT * FROM battle_history_view WHERE user_id = :userId", nativeQuery = true)
    List<BattleHistoryView> findByUserId(@Param("userId") Long userId);

    // 페이지네이션 메서드 추가
    @Query(value = "SELECT * FROM battle_history_view WHERE user_id = :userId ORDER BY created_at DESC",
        countQuery = "SELECT count(*) FROM battle_history_view WHERE user_id = :userId",
        nativeQuery = true)
    Page<BattleHistoryView> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query(value = "SELECT user_id, " +
        "COUNT(*) as total, " +
        "SUM(CASE WHEN is_winner = true AND earned_score >= 0 THEN 1 ELSE 0 END) as wins, " +
        "SUM(CASE WHEN is_winner = false AND earned_score < 0 THEN 1 ELSE 0 END) as losses, " +
        "SUM(CASE WHEN is_winner = false AND earned_score >= 0 THEN 1 ELSE 0 END) as draws " +
        "FROM battle_history_view " +
        "WHERE user_id = :userId GROUP BY user_id",
        nativeQuery = true)
    BattleStatsInfo findBattleStatsByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT vo.option_title as optionTitle, vo.is_winner as isWinner, br.earned_score as earnedScore " +
        "FROM vote_record vr " +
        "JOIN vote_option vo ON vr.vote_option_id = vo.vote_option_id " +
        "JOIN betting_record br ON vr.vote_record_id = br.vote_record_id " +
        "WHERE vr.user_id = :userId " +
        "AND vr.vote_id = (SELECT v.vote_id FROM vote v WHERE v.battle_id = :battleId)",
        nativeQuery = true)
    BattleResultDto findBattleResult(@Param("userId") Long userId, @Param("battleId") Long battleId);
}
