package com.overthecam.auth.controller;

import com.overthecam.auth.dto.LoginRequest;
import com.overthecam.auth.dto.SignUpRequest;
import com.overthecam.auth.dto.TokenResponse;
import com.overthecam.auth.dto.UserResponse;
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

}