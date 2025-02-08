package com.overthecam.battle.repository;

import com.overthecam.battle.domain.BattleParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleParticipantRepository extends JpaRepository<BattleParticipant, Long> {
    @Query("SELECT bp FROM BattleParticipant bp JOIN FETCH bp.user WHERE bp.battle.id = :battleId")
    List<BattleParticipant> findAllByBattleIdWithUser(@Param("battleId") Long battleId);

    List<BattleParticipant> findAllByBattleId(Long battleId);

    void deleteAllByBattleId(Long battleId);
}
