package com.overthecam.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserScoreInfo {
    private Integer supportScore;
    private Integer point;

    // static factory methods
    public static UserScoreInfo updateSupportScore(int score) {
        UserScoreInfo data = new UserScoreInfo(score, null);
        return data;
    }

    public static UserScoreInfo updatePoints(int points) {
        UserScoreInfo data = new UserScoreInfo(null, points);
        return data;
    }
}
