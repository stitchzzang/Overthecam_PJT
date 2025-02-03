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
    @NotBlank
    @Email
    private String email;

    @NotBlank
    //@Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,20}$")
    private String password;

    @NotBlank
    @Size(min = 2, max = 10)
    private String nickname;

    @NotNull
    @Min(0) @Max(1)
    private Integer gender;

    @NotNull
    @Past
    private LocalDate birth;

    @NotBlank
    @Pattern(regexp = "^\\d{3}-\\d{3,4}-\\d{4}$")
    private String phoneNumber;
}