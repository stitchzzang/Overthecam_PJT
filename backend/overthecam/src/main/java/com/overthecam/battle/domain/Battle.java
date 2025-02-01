package com.overthecam.battle.domain;

import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@Table(name = "battle")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Battle extends TimeStampEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "battle_id")
    private Long id;

    //@ManyToOne(fetch = FetchType.LAZY)
    //@JoinColumn(name = "user_id", nullable = false)
    //private User user;  // 방장 사용자
    private String sessionId;

    @Column(nullable = false)
    private String title;

    @Column(name = "room_url", nullable = false)
    private String roomUrl;

    @Column(name = "thumbnail_url", nullable = false)
    private String thumbnailUrl;

    @Column(name = "total_time")
    private Integer totalTime;

    @Column(name = "user_count")
    private Integer userCount = 0;

    @Column(name = "status")
    private Integer status = 0;

    public void updateStatus(int status) {
        this.status = status;
    }

}

