package com.overthecam.battle.repository;

import com.overthecam.battle.domain.Battle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BattleRepository extends JpaRepository<Battle, Long> {
    long countUsersByBattleId(Long battleId);  // 참가자 수 카운트 메서드
}
