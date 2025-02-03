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
        String token = extractToken(authentication);
        return jwtTokenProvider.getUserId(token);
    }

    public String extractToken(Authentication authentication) {
        String credentials = (String) authentication.getCredentials();
        if (credentials == null) {
            throw new IllegalArgumentException("인증 정보가 없습니다");
        }
        return credentials;
    }
}