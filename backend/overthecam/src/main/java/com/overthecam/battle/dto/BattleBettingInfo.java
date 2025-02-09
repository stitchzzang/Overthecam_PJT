package com.overthecam.battle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BattleBettingInfo {
    private Long userId;
    private Long battleId;
    private Long voteOptionId;
    private Integer supportScore;

    // Redis 저장용 키 생성
    public String generateKey() {
        return String.format("battle:%d:vote:%d", battleId, userId);
    }
}
