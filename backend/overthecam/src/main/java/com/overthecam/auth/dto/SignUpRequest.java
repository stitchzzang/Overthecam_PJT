//package com.overthecam.auth.dto;
//
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//import java.time.LocalDate;
//
//@Getter
//@NoArgsConstructor
//public class SignUpRequest {
//    @NotBlank private String email;
//    @NotBlank private String password;
//    @NotBlank private String nickname;
//    @NotNull private Integer gender;
//    @NotNull private LocalDate birth;
//    @NotBlank private String phoneNumber;
//}

package com.overthecam.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SignUpRequest {
    @NotBlank(message = "이메일은 필수 입력값입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력값입니다")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,20}$",
            message = "비밀번호는 8~20자리수여야 합니다. 영문 대소문자, 숫자, 특수문자를 1개 이상 포함해야 합니다."
    )
    private String password;

    @NotBlank(message = "닉네임은 필수 입력값입니다")
    @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하여야 합니다")
    private String nickname;

    @NotNull(message = "성별은 필수 입력값입니다")
    @Min(value = 0, message = "성별 값이 올바르지 않습니다")
    @Max(value = 1, message = "성별 값이 올바르지 않습니다")
    private Integer gender;

    @NotNull(message = "생년월일은 필수 입력값입니다")
    @Past(message = "생년월일은 과거 날짜여야 합니다")
    private LocalDate birth;

    @NotBlank(message = "전화번호는 필수 입력값입니다")
    @Pattern(
            regexp = "^\\d{3}-\\d{3,4}-\\d{4}$",
            message = "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)"
    )
    private String phoneNumber;
}