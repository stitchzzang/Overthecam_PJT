package com.overthecam.vote.domain;
// - 사용자의 투표 이력 관리
// - 중복 투표 방지에 사용

import com.overthecam.auth.domain.User;
import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "vote_record")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VoteRecord extends TimeStampEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long voteRecordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = false)
    private Vote vote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_option_id", nullable = false)
    private VoteOption voteOption;

    @Builder
    public VoteRecord(User user, Vote vote, VoteOption voteOption) {
        this.user = user;
        this.vote = vote;
        this.voteOption = voteOption;
    }

    public void updateVoteOption(VoteOption newOption) {
        this.voteOption = newOption;
    }
}