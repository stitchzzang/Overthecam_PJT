package com.overthecam.member.service;

import com.overthecam.member.domain.BattleHistoryView;
import com.overthecam.member.dto.BattleStatsInfo;
import com.overthecam.member.repository.BattleHistoryViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BattleHIstoryService {

    private final BattleHistoryViewRepository battleHistoryViewRepository;

    public List<BattleHistoryView> findBattleHistoryViewByUserId(Long userId) {
        return battleHistoryViewRepository.findByUserId(userId);
    }

    // 전적 통계를 위한 메서드 추가
    public BattleStatsInfo getBattleStats(Long userId) {
        return battleHistoryViewRepository.findBattleStatsByUserId(userId);
    }
}
