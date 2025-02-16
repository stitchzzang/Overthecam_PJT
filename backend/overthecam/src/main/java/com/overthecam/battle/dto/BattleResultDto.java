package com.overthecam.battle.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BattleResultDto {
    private String optionTitle;
    private boolean isWinner;
    private Integer earnedScore;
}
