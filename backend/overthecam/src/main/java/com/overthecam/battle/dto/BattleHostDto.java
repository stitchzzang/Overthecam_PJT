package com.overthecam.battle.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;


@Getter
@Builder
public class BattleHostDto {
    private final Long battleId;
    private final String title;
    private final Integer totalTime;
    private final String hostNickname;
    private final LocalDateTime createdAt;

}
