package com.overthecam.auth.domain;

import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends TimeStampEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false)
    private String nickname;

    private String profileImage;

    @Column(unique = true)
    private String email;

    private LocalDate birth;

    @Column(nullable = false)
    private Integer gender;

    private String password;

    @Column(columnDefinition = "INT DEFAULT 100")
    private Integer supportScore = 100;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer point = 0;

    @Builder
    public User(String nickname, String email, Integer gender, String password) {
        this.nickname = nickname;
        this.email = email;
        this.gender = gender;
        this.password = password;
        this.supportScore = 50000;
    }
}