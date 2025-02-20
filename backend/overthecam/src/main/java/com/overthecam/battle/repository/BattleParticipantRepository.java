package com.overthecam.battle.repository;

import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
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

    @Query("SELECT bp.role FROM BattleParticipant bp WHERE bp.battle.id = :battleId AND bp.user.id = :userId")
    ParticipantRole findRoleByBattleIdAndUserId(@Param("battleId") Long battleId, @Param("userId") Long userId);

    void deleteAllByBattleId(Long battleId);

    void deleteByBattleIdAndUserId(Long battleId, Long userId);

    long countByBattleId(Long battleId);

    @Query("SELECT u.nickname " +
            "FROM BattleParticipant bp " +
            "JOIN User u ON bp.user.id = u.id " +
            "WHERE bp.battle.id = :battleId")
    List<String> findParticipantNicknamesByBattleId(@Param("battleId") Long battleId);

    BattleParticipant findByUser_IdAndBattle_Id(Long userId, Long battleId);
}
