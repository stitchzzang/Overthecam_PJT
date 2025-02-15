package com.overthecam.battle.repository;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.dto.BattleHostDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BattleRepository extends JpaRepository<Battle, Long> {
    long countUsersById(Long battleId);  // 참가자 수 카운트 메서드

    List<Battle> findByStatusIn(List<Status> list);

    // 상태 목록으로 조회 + 생성일시 내림차순 정렬
    List<Battle> findByStatusInOrderByCreatedAtDesc(List<Status> list);

    Page<Battle> findByTitleContainingIgnoreCase(String trim, Pageable pageable);

    Battle findBattleById(Long battleId);

    @Query("SELECT new com.overthecam.battle.dto.BattleHostDto(b.id, b.title, b.totalTime, u.nickname) " +
            "FROM Battle b " +
            "JOIN BattleParticipant bp ON b.id = bp.battle.id " +
            "JOIN User u ON bp.user.id = u.id " +
            "WHERE b.id = :battleId " +
            "AND bp.role IN (com.overthecam.battle.domain.ParticipantRole.HOST, " +
            "com.overthecam.battle.domain.ParticipantRole.HOST_BATTLER)")
    Optional<BattleHostDto> findBattleWithHost(@Param("battleId") Long battleId);
}
