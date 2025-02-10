package com.overthecam.auth.controller;

import com.overthecam.auth.dto.*;
import com.overthecam.auth.service.AuthService;
import com.overthecam.common.dto.CommonResponseDto;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public CommonResponseDto<UserResponse> signup(@Valid @RequestBody SignUpRequest request) {
        UserResponse userResponse = authService.signup(request);
        return CommonResponseDto.ok(userResponse);
    }

    @PostMapping("/login")
    public CommonResponseDto<TokenResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletResponse response) {
        TokenResponse tokenResponse = authService.login(request, response);
        return CommonResponseDto.ok(tokenResponse);
    }

    @PostMapping("/logout")
    public CommonResponseDto<Void> logout(HttpServletResponse response) {
        authService.logout(response);
        return CommonResponseDto.ok();
    }

    @PostMapping("/find-email")
    public CommonResponseDto<UserResponse> findEmail(@Valid @RequestBody FindEmailRequest request) {
        UserResponse userResponse = authService.findEmail(request);
        return CommonResponseDto.ok(userResponse);
    }

    /**
     * 비밀번호 재설정을 위한 사용자 확인 (1단계)
     */
    @PostMapping("/verify-password-reset")
    public CommonResponseDto<Void> verifyPasswordReset(
            @Valid @RequestBody VerifyPasswordResetRequest request) {
        authService.verifyPasswordReset(request);
        return CommonResponseDto.ok();
    }

    /**
     * 새 비밀번호 설정 (2단계)
     */
    @PostMapping("/reset-password")
    public CommonResponseDto<TokenResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletResponse response) {
        TokenResponse tokenResponse = authService.resetPassword(request, response);
        return CommonResponseDto.ok(tokenResponse);
    }
}