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
//
//    @Version
//    private Long version;   // 낙관적 락 추가 - Optimistic Lock 추가 - 동시성 처리 에러 예방

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id")
    private Vote vote;

    @Column(nullable = false)
    private String optionTitle;

    @Builder.Default
    private int voteCount = 0;

    @Builder.Default
    private boolean isWinner = false;

//    @Builder
//    public VoteOption(String optionTitle) {
//        this.optionTitle = optionTitle;
//    }

    // 부모 투표 설정 메서드
    public void setVote(Vote vote) {    // 엔터티 생성 및 연관관계 일관성 유지
        this.vote = vote;
    }

//    public void setVoteCount(int count) {
//        this.voteCount = count;
//    }

//    // 투표 수 증가 메서드
//    public void incrementVoteCount() {
//        this.voteCount++;
//    }

    public void updateVoteCount(int count) {
        if (count < 0) {
            throw new IllegalArgumentException("투표 수는 음수일 수 없습니다.");
        }
        this.voteCount = count;
    }
}
