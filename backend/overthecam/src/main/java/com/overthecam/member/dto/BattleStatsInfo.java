package com.overthecam.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BattleStatsInfo {
    private Long userId;
    private Long totalGames;
    private Long wins;
    private Long losses;
    private Long draws;

    // 승률 계산 메서드
    public double getWinRate() {
        if (totalGames == 0) return 0.0;
        return (double) wins / totalGames * 100;
    }
}
