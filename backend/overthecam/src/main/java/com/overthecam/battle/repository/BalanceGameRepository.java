package com.overthecam.battle.repository;

import com.overthecam.battle.domain.BalanceGame;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BalanceGameRepository extends JpaRepository<BalanceGame, Long> {

    // MySQL의 RAND() 함수를 사용하여 랜덤 레코드 조회
    @Query(value = "SELECT * FROM balance_game ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<BalanceGame> findRandomBalanceGame();
}