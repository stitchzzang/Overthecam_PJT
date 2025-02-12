package com.overthecam.auth.domain;

import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "user")
@Getter
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

    @Column(columnDefinition = "INT DEFAULT 100")
    private Integer supportScore = 100;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer point = 0;

    @Column(length = 500)
    private String refreshToken; // Refresh Token 저장

    @Builder
    public User(String nickname, String email, String profileImage, String username, Integer gender, String password, LocalDate birth, String phoneNumber) {
        this.nickname = nickname;
        this.email = email;
        this.profileImage = profileImage;
        this.username = username;
        this.gender = gender;
        this.password = password;
        this.birth = birth;
        this.phoneNumber = phoneNumber;
        this.supportScore = 50000;
    }

    @Builder(builderMethodName = "userIdBuilder")
    public User(Long id) {
        this.id = id;
    }

    public void setSupportScore(Integer supportScore) {
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