package com.overthecam.battle.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BattleData {
    Long battleId;
    String sessionId;
    private Integer cheerScore; // 응원 점수
    private Integer points; // 포인트
    private List<ParticipantInfo> participants; // 참여자 정보
    private VoteInfo voteInfo; // 투표 정보
    private LocalDateTime timestamp;

    // 전체 데이터용 생성자
    public BattleData(Integer cheerScore, Integer points) {
        this.cheerScore = cheerScore;
        this.points = points;
        this.timestamp = LocalDateTime.now();
    }

    // 전체 데이터용 팩토리 메소드
    public static BattleData initialData(
        Integer cheerScore,
        Integer points,
        List<ParticipantInfo> participants,
        VoteInfo voteInfo) {

        return BattleData.builder()
            .cheerScore(cheerScore)
            .points(points)
            .participants(participants)
            .voteInfo(voteInfo)
            .timestamp(LocalDateTime.now())
            .build();
    }

    // static factory methods
    public static BattleData updateSupportScore(int score) {
        BattleData data = new BattleData(score, null);
        return data;
    }

    public static BattleData updatePoints(int points) {
        BattleData data = new BattleData(null, points);
        return data;
    }

    public static BattleData updateVote(VoteInfo voteInfo) {
        return BattleData.builder()
            .voteInfo(voteInfo)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
