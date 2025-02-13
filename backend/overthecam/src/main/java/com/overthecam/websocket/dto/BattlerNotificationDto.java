package com.overthecam.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BattlerNotificationDto {
    private BattlerInfo firstBattler;
    private BattlerInfo secondBattler;

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BattlerInfo {
        private Long userId;
        private String nickname;
        private Long optionId;
    }
}
