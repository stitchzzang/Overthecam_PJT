package com.overthecam.battle.repository;

import com.overthecam.battle.domain.BattleParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BattleParticipantRepository extends JpaRepository<BattleParticipant, Long> {
}
