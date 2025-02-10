package com.overthecam.auth.dto;
// 비밀번호 재설정 2단계: 새 비밀번호 설정 (email + newPassword)

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ResetPasswordRequest {
    @NotBlank
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank
//    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,20}$",
//            message = "비밀번호는 8~20자리수여야 하며, 영문, 숫자, 특수문자를 1개 이상 포함해야 합니다.")
    private String newPassword;
}