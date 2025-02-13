package com.overthecam.battle.domain;

import com.overthecam.vote.domain.VoteRecord;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@Table(name = "betting_record")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BettingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "betting_record_id")
    private Long bettingRecordId;

    @ManyToOne
    @JoinColumn(name = "vote_record_id", nullable = false)
    private VoteRecord voteRecord;  // 투표 기록과의 연관

    @Column(name = "betting_score", nullable = false)
    private Integer bettingScore;  // 배팅한 금액

    @Column(name = "earned_score", nullable = false)
    private Integer earnedScore = 0;  // 배당금

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();  // 배팅 기록 생성 시점

}
