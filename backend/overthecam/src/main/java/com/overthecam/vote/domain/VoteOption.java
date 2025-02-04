package com.overthecam.vote.domain;
// - 각 투표의 선택지 정보 관리
// - 득표수 카운팅

import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "vote_option")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VoteOption extends TimeStampEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long voteOptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id")
    private Vote vote;

    @Column(nullable = false)
    private String optionTitle;

    @Column(nullable = false)
    private int voteCount = 0;

    @Column(nullable = false)
    private boolean isWinner = false;

    @Builder
    public VoteOption(String optionTitle) {
        this.optionTitle = optionTitle;
    }

    public void setVote(Vote vote) {
        this.vote = vote;
    }

    public void incrementVoteCount() {
        this.voteCount++;
    }

    public void decrementVoteCount() {
        if (this.voteCount > 0) {
            this.voteCount--;
        }
    }
}