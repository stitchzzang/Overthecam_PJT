package com.overthecam.battle.dto;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BattleInfo {
    private Long battleId;
    private String thumbnailUrl;
    private Status status;
    private String title;
    private int totalUsers;

    public static BattleInfo from(Battle battle) {
        return BattleInfo.builder()
                .battleId(battle.getId())
                .thumbnailUrl(battle.getThumbnailUrl())
                .status(battle.getStatus())
                .title(battle.getTitle())
                .totalUsers(battle.getTotalUsers())
                .build();
    }
}
