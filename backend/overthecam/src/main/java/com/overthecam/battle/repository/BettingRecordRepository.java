package com.overthecam.battle.repository;

import com.overthecam.battle.domain.BettingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BettingRecordRepository extends JpaRepository<BettingRecord, Long> {
}