package com.overthecam.battle.repository;

import com.overthecam.battle.domain.Battle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BattleRepository extends JpaRepository<Battle, Long> {

}
