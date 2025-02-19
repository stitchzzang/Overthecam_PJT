package com.overthecam.battlereport.repository;

import com.overthecam.battlereport.domain.BattleReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BattleReportRepository extends JpaRepository<BattleReport, Long> {
    List<BattleReport> findByUserIdOrderByCreatedAtDesc(Integer userId);
    Optional<BattleReport> findByIdAndUserId(Long id, Integer userId);
}