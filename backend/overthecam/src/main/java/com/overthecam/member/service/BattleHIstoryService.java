package com.overthecam.member.service;

import com.overthecam.member.domain.BattleHistoryView;
import com.overthecam.member.dto.BattleStatsInfo;
import com.overthecam.member.repository.BattleHistoryPageResponse;
import com.overthecam.member.repository.BattleHistoryViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BattleHIstoryService {

    private final BattleHistoryViewRepository battleHistoryViewRepository;

    public BattleHistoryPageResponse findBattleHistoryViewByUserId(Long userId, Pageable pageable) {
        Page<BattleHistoryView> battles = battleHistoryViewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return BattleHistoryPageResponse.of(battles);
    }

    // 전적 통계를 위한 메서드 추가
    public BattleStatsInfo getBattleStats(Long userId) {
        return battleHistoryViewRepository.findBattleStatsByUserId(userId);
    }
}
