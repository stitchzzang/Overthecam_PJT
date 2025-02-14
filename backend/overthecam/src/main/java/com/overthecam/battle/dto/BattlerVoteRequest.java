package com.overthecam.battle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BattlerVoteRequest {
    private Long firstBattlerId;  // 첫 번째 배틀러 userId
    private Long secondBattlerId; // 두 번째 배틀러 userId
    private Long firstOptionId;   // 첫 번째 배틀러의 선택
    private Long secondOptionId;  // 두 번째 배틀러의 선택
}

