package com.overthecam.auth.controller;

import com.overthecam.auth.dto.LoginRequest;
import com.overthecam.auth.dto.SignUpRequest;
import com.overthecam.auth.dto.TokenResponse;
import com.overthecam.auth.dto.UserResponse;
import com.overthecam.auth.service.AuthService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.exception.ErrorCode;
import com.overthecam.exception.GlobalException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
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

    // 회원가입
    @PostMapping("/signup")
    public CommonResponseDto<UserResponse> signup(@Valid @RequestBody SignUpRequest request) {
        return authService.signup(request);
    }

    // 로그인
    @PostMapping("/login")
    public CommonResponseDto<TokenResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return authService.login(request, response);
    }

    @PostMapping("/logout")
    public CommonResponseDto<Void> logout(HttpServletResponse response) {
        return authService.logout(response);
    }

}