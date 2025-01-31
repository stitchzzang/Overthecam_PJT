package com.overthecam.battle.repository;

import com.overthecam.battle.domain.Battle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BattleRepository extends JpaRepository<Battle, Long> {
    Optional<Battle> findBySessionId(String sessionId);
}
