package com.overthecam.member.dto;

import com.overthecam.battle.domain.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BattleStatProjection {
    private Long userId;
    private ParticipantRole role;
    private boolean isWinner;
    private Integer earnedScore;
}
