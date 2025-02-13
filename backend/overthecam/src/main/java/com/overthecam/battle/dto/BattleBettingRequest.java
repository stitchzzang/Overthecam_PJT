package com.overthecam.battle.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class BattleBettingRequest {
    private Long optionId;
    private Integer supportScore;
}
