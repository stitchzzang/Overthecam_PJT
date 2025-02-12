package com.overthecam.member.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "battle_history_view")
@Immutable
public class BattleHistoryView {
    @Id
    @Column(name = "battle_id")
    private Long battleId;

    @Column(name = "title")
    private String title;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "vote_id")
    private Long voteId;

    @Column(name = "vote_option_id")
    private Long voteOptionId;

    @Column(name = "option_title")
    private String optionTitle;

    @Column(name = "is_winner")
    private boolean isWinner;

    @Column(name = "earned_score")
    private Integer earnedScore;

    @Column(name = "created_at")
    private LocalDateTime date;
}
