package com.overthecam.battle.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BattleResultResponse {
    private String battleTitle;
    private List<OptionResult> options;
    private List<UserResult> userResults;
    private WinningInfo winningInfo;    // 승리 정보 추가

    @Getter
    @Builder
    public static class OptionResult {
        private Long optionId;
        private String optionTitle;
        private double percentage;
        private int totalScore;
        private boolean isWinner;        // 승리 옵션 여부 추가
    }

    @Getter
    @Builder
    public static class UserResult {
        private Long userId;
        private String nickname;
        private boolean isWinner;
        private int originalScore;      // 원래 배팅한 점수
        private int resultScore;        // 최종 획득/손실 점수 (+/- 부호 포함)
        private Long selectedOptionId;
    }

    @Getter
    @Builder
    public static class WinningInfo {
        private boolean isDraw;         // 무승부 여부
        private Long winningOptionId;   // 승리한 옵션 ID (무승부시 null)
        private int totalParticipants;  // 총 참여자 수
        private int totalBettingScore;  // 총 배팅 응원점수
    }
}