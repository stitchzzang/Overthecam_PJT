package com.overthecam.member.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserUpdateRequestDto {
    private String password;
    private String nickname;
    private String phoneNumber;
}

