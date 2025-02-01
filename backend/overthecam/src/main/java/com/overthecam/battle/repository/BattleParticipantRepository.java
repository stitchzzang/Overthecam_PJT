package com.overthecam.battle.repository;

import com.overthecam.battle.domain.BattleParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BattleParticipantRepository extends JpaRepository<BattleParticipant, Long> {
    List<BattleParticipant> findAllByBattleId(Long battleId);
}
