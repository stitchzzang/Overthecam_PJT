package com.overthecam.battle.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BattleResultResponse {
    private String battleTitle;
    private List<OptionResult> options;
    private List<UserResult> userResults;

    @Getter
    @Builder
    public static class OptionResult {
        private Long optionId;
        private String optionTitle;
        private Double percentage;
        private Integer totalScore;
    }

    @Getter
    @Builder
    public static class UserResult {
        private Long userId;
        private String nickname;
        private Boolean isWinner;
        private Integer supportScore;
        private Long selectedOptionId;
    }
}