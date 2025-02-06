package com.overthecam.battle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BattleInfo {
    private String thumbnailUrl;
    private int status;
    private String title;
    private int totalUsers;
}
