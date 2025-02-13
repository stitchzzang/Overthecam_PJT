package com.overthecam.auth.domain;

import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Builder
@Entity
@Table(name = "user")
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends TimeStampEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false)
    private String nickname;

    private String profileImage;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String username;

    private LocalDate birth;

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Column(nullable = false)
    private Integer gender;

    private String password;

    @Builder.Default
    @Column(columnDefinition = "INT DEFAULT 5000")
    private Integer supportScore = 5000;

    @Builder.Default
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer point = 100;

    @Column(length = 500)
    private String refreshToken; // Refresh Token 저장


    public void updateSupportScores(Integer supportScore) {
        this.supportScore = supportScore;
    }

    // Refresh Token 관리
    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void clearRefreshToken() {
        this.refreshToken = null;
    }

    // 비밀번호 찾기 - 새 비밀번호 설정
    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    public void setPoint(int point) {
        this.point = point;
    }
}