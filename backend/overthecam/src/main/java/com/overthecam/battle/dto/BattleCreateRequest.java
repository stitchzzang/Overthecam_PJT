package com.overthecam.battle.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BattleCreateRequest {
    private String title;
}
