package com.overthecam.battle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor  // 기본 생성자
@AllArgsConstructor // 모든 필드를 가진 생성자
public class BattleRoomAllResponse {
    private List<BattleInfo> battleInfo;
}
