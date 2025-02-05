package com.overthecam.security.util;

import com.overthecam.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {
    private final JwtTokenProvider jwtTokenProvider;

    public Long getCurrentUserId(Authentication authentication) {
        // 1. 인증 객체가 null인지 먼저 확인
        if (authentication == null) {
            return null; // 인증 정보 없음
        }

        try {
            // 2. 토큰 추출 시도
            String token = extractToken(authentication);

            // 3. 토큰에서 사용자 ID 추출
            return jwtTokenProvider.getUserId(token);
        } catch (Exception e) {
            // 4. 토큰 추출 또는 사용자 ID 추출 중 오류 발생 시
            return null;
        }
    }

    public String extractToken(Authentication authentication) {
        // 인증 정보에서 자격증명(토큰) 추출
        String credentials = (String) authentication.getCredentials();

        // 자격증명이 없으면 예외 발생
        if (credentials == null) {
            throw new IllegalArgumentException("인증 정보가 없습니다");
        }

        return credentials;
    }
}