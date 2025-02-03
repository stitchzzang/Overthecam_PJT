package com.overthecam.battle.domain;

import com.overthecam.auth.domain.User;
import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@Table(name = "battle_participant")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BattleParticipant extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "battle_participant_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "battle_id")
    private Battle battle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @JoinColumn(name = "role")
    private Integer role;


    // role 업데이트 메서드
    public void updateRole(int role) {
        this.role = role;
    }

}
