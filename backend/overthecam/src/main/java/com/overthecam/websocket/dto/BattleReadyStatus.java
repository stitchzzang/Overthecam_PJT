package com.overthecam.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BattleReadyStatus {
    private Long userId;
    private String nickname;
    private boolean ready;    // 현재 사용자의 준비 상태만 반환
}
