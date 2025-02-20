package com.overthecam.member.repository;

import com.overthecam.battle.dto.BattleResultDto;
import com.overthecam.member.domain.BattleHistoryView;
import com.overthecam.member.dto.BattleStatProjection;
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


    @Query("SELECT new com.overthecam.member.dto.BattleStatProjection(" +
            "b.userId, b.role, b.isWinner, b.earnedScore) " +
            "FROM BattleHistoryView b WHERE b.userId = :userId")
    List<BattleStatProjection> findBattleStatsDataByUserId(@Param("userId") Long userId);

    @Query("SELECT new com.overthecam.battle.dto.BattleResultDto(vo.optionTitle, vo.isWinner, br.earnedScore) " +
            "FROM VoteRecord vr " +
            "JOIN VoteOption vo ON vr.voteOption.voteOptionId = vo.voteOptionId " +
            "JOIN BettingRecord br ON vr.voteRecordId = br.voteRecord.voteRecordId " +
            "WHERE vr.user.id = :userId " +
            "AND vr.vote.voteId = (SELECT v.voteId FROM Vote v WHERE v.battle.id = :battleId)")
    BattleResultDto findBattleResult(@Param("userId") Long userId, @Param("battleId") Long battleId);

}
