package com.overthecam.auth.controller;

import com.overthecam.auth.dto.LoginRequest;
import com.overthecam.auth.dto.SignUpRequest;
import com.overthecam.auth.dto.TokenResponse;
import com.overthecam.auth.dto.UserResponse;
import com.overthecam.auth.service.AuthService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.exception.ErrorCode;
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

    @PostMapping("/signup")
    public CommonResponseDto<UserResponse> signup(
            @Valid @RequestBody SignUpRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public CommonResponseDto<TokenResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        return authService.login(request, response);
    }

    @PostMapping("/refresh")
    public CommonResponseDto<TokenResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        log.info("토큰 갱신 요청 수신");

        // 쿠키에서 refresh token 추출
        Cookie[] cookies = request.getCookies();
        String refreshToken = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                log.info("쿠키 발견: {} = {}", cookie.getName(), cookie.getValue());
                if ("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            log.error("Refresh Token이 없습니다");
            return CommonResponseDto.error(ErrorCode.INVALID_TOKEN);
        }

        return authService.refreshAccessToken(refreshToken, response);
    }

    @PostMapping("/logout")
    public CommonResponseDto<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String token,
            HttpServletResponse response) {
        if (token == null || !token.startsWith("Bearer ")) {
            log.error("유효하지 않은 토큰 형식입니다: {}", token);
            return CommonResponseDto.error(ErrorCode.INVALID_TOKEN);
        }
        return authService.logout(token, response);
    }
}