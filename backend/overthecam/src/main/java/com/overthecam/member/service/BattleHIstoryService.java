package com.overthecam.member.service;

import com.overthecam.member.domain.BattleHistoryView;
import com.overthecam.member.repository.BattleHistoryViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BattleHIstoryService {

    private final BattleHistoryViewRepository battleHistoryViewRepository;

    public List<BattleHistoryView> findBattleHistoryViewByUserId(Long userId) {
        return battleHistoryViewRepository.findByUserId(userId);
    }
}
