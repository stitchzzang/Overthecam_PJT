package com.overthecam.battle.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BattleData {
    private Integer cheerScore;
    private Integer points;
    private LocalDateTime timestamp;

    // 전체 데이터용 생성자
    public BattleData(Integer cheerScore, Integer points) {
        this.cheerScore = cheerScore;
        this.points = points;
        this.timestamp = LocalDateTime.now();
    }

    // static factory methods
    public static BattleData cheerScoreOnly(int score) {
        BattleData data = new BattleData(score, null);
        return data;
    }

    public static BattleData pointsOnly(int points) {
        BattleData data = new BattleData(null, points);
        return data;
    }
}
