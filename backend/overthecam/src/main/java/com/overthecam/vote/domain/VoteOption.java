package com.overthecam.vote.domain;

import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class VoteOption extends TimeStampEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long voteOptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id")
    private Vote vote;

    @Column(nullable = false)
    private String optionTitle;

    @Builder.Default
    private int voteCount = 0;

    @Builder.Default
    private boolean isWinner = false;

    // 부모 투표 설정 메서드
    public void setVote(Vote vote) {    // 엔터티 생성 및 연관관계 일관성 유지
        this.vote = vote;
    }

    public void updateVoteCount(int count) {
        if (count < 0) {
            throw new IllegalArgumentException("투표 수는 음수일 수 없습니다.");
        }
        this.voteCount = count;
    }

    public void updateWinnerStatus(boolean isWinner) {
        this.isWinner = isWinner;
    }
}
