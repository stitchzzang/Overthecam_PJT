package com.overthecam.member.repository;

import com.overthecam.member.domain.BattleHistoryView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleHistoryViewRepository extends JpaRepository<BattleHistoryView, Long> {

    // 유저의 전적 조회
    List<BattleHistoryView> findByUserId(Long userId);
}
