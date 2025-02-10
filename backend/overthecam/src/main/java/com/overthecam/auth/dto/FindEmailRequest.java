package com.overthecam.auth.dto;
// 이메일 찾기 (username + phoneNumber)

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FindEmailRequest {
    @NotBlank
    private String username;

    @NotBlank
    @Pattern(regexp = "^\\d{3}-\\d{3,4}-\\d{4}$")
    private String phoneNumber;
}