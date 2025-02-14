package com.overthecam.battle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BattleRoomResponse {
    private Long battleId;
    private String token;
    private String roomName;
}
