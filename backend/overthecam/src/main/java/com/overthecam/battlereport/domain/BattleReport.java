package com.overthecam.battlereport.domain;

import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "battle_reports")
public class BattleReport extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "emotion_analysis", columnDefinition = "JSON")
    private String emotionAnalysis;

    @Column(name = "key_arguments", columnDefinition = "JSON")
    private String keyArguments;

    @Column(name = "debate_analysis", columnDefinition = "JSON")
    private String debateAnalysis;

    @Column(name = "ai_evaluation", columnDefinition = "JSON")
    private String aiEvaluation;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();  // 배팅 기록 생성 시점
}