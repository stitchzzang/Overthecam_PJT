package com.overthecam.member.dto;

import com.overthecam.auth.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class UserUpdateResponseDto {
    private String email;
    private String username;
    private Integer gender;
    private LocalDate birth;
    private String nickname;
    private String phoneNumber;

    public static UserUpdateResponseDto from(User user) {
        return UserUpdateResponseDto.builder()
                .email(user.getEmail())
                .username(user.getUsername())
                .gender(user.getGender())
                .birth(user.getBirth())
                .nickname(user.getNickname())
                .phoneNumber(user.getPhoneNumber())
                .build();
    }
}
