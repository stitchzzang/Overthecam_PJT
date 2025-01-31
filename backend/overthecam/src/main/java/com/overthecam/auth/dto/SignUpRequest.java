package com.overthecam.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignUpRequest {
    @NotBlank private String email;
    @NotBlank private String password;
    @NotBlank private String nickname;
    @NotNull private Integer gender;
}