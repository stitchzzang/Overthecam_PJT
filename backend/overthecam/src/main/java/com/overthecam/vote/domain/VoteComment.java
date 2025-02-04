package com.overthecam.vote.domain;

import com.overthecam.auth.domain.User;
import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "vote_comment")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VoteComment extends TimeStampEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long voteCommentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = false)
    private Vote vote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String content;

    public void updateContent(String content) {
        this.content = content;
        super.updatedAt = LocalDateTime.now();
    }

    @Builder
    public VoteComment(Vote vote, User user, String content) {
        this.vote = vote;
        this.user = user;
        this.content = content;
        super.createdAt = LocalDateTime.now();
    }
}