package com.overthecam.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserScoreInfo {
    private Integer supportScore;
    private Integer point;

    // static factory methods
    public static UserScoreInfo updateSupportScore(int score) {
        return new UserScoreInfo(score, null);
    }

    public static UserScoreInfo updatePoints(int points) {
        return new UserScoreInfo(null, points);
    }


}
