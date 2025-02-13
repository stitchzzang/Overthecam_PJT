package com.overthecam.battle.repository;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleRepository extends JpaRepository<Battle, Long> {
    long countUsersById(Long battleId);  // 참가자 수 카운트 메서드

    List<Battle> findByStatusIn(List<Status> list);

    // 상태 목록으로 조회 + 생성일시 내림차순 정렬
    List<Battle> findByStatusInOrderByCreatedAtDesc(List<Status> list);

    Page<Battle> findByTitleContainingIgnoreCase(String trim, Pageable pageable);
}
