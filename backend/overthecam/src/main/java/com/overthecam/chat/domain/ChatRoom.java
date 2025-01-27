package com.overthecam.chat.domain;

import com.overthecam.battle.domain.Battle;
import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@Entity
@Builder
@ToString
@Table(name = "chat_room")
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoom extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY) // 배틀방 1개당 채팅방 1개
    @JoinColumn(name = "battle_id", nullable = false)
    private Battle battle;

    @Builder.Default
    @Column(name = "active")
    private boolean active = true;

}
