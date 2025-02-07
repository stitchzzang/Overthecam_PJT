package com.overthecam.vote.domain;

import com.overthecam.auth.domain.User;
import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Vote extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long voteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String content;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Builder.Default
    private boolean isActive = true;

    @Column
    private Long battleId;

    @Builder.Default
    @OneToMany(mappedBy = "vote", cascade = CascadeType.ALL, orphanRemoval = true)      // 연관관계에서 제거된 VoteOption 엔티티 자동삭제
    private List<VoteOption> options = new ArrayList<>();

//    @Builder
//    public Vote(User user, String title, String content, LocalDateTime endDate, Long battleId) {
//        this.user = user;
//        this.title = title;
//        this.content = content;
//        this.endDate = endDate;
//        this.battleId = battleId;
//    }

    public void addOption(VoteOption option) {
        this.options.add(option);
        option.setVote(this);
    }

    // 투표의 활성 상태를 비활성으로 변경
    public void setInactive() {
        this.isActive = false;
    }
}