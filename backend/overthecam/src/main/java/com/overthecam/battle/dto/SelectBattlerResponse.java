package com.overthecam.battle.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SelectBattlerResponse {
    private Long battleId;
    private String sessionId;
}
