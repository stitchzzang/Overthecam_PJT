package com.overthecam.battle.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BattleWebSocketMessage<T> {
    private Long battleId;
    private Long userId;
    private BattleDataType type;
    private T data;
}
