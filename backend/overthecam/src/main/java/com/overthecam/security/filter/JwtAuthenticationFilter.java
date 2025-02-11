package com.overthecam.security.filter;
// 모든 요청에 대한 JWT 토큰 검증

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.common.dto.ErrorResponse;
import com.overthecam.security.jwt.JwtTokenProvider;
import com.overthecam.security.config.SecurityPath;
import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.exception.GlobalException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // 필수 의존성 주입
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 상수 정의
    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // 1. 토큰 추출 시도
            String accessToken = resolveToken(request);

            // 2. 토큰이 있는 경우 - 항상 검증 진행 (인증 불필요 URI여도 검증)
            if (accessToken != null) {
                processToken(accessToken, request, response);
            }
            // 3. 토큰이 없는 경우
            else {
                // 인증 불필요 URI가 아닌데 토큰이 없으면 예외
                if (!isPermitAllEndpoint(request.getRequestURI())) {
                    throw new GlobalException(AuthErrorCode.TOKEN_NOT_FOUND,
                            "인증 토큰이 필요합니다");
                }
                // 인증 불필요 URI면 그냥 통과
            }

            filterChain.doFilter(request, response);
        } catch (GlobalException e) {
            setErrorResponse(response, e);
        }
    }

    private boolean isPermitAllEndpoint(String uri) {
        return SecurityPath.matches(uri);
    }

    /**
     * 토큰 처리 로직
     * 1. 토큰 유효성 검증
     * 2. 만료된 경우 리프레시 토큰으로 갱신
     */
    private void processToken(String accessToken, HttpServletRequest request, HttpServletResponse response) {
        if (accessToken != null) {
            if (tokenProvider.isExpiredToken(accessToken)) {
                processRefreshToken(request, response);
            }
            if (tokenProvider.validateToken(accessToken)) {
                setAuthentication(accessToken);
            } else {
                throw new GlobalException(AuthErrorCode.INVALID_TOKEN_SIGNATURE,
                        "토큰의 서명이 유효하지 않습니다");
            }
        }
    }

    /**
     * 리프레시 토큰 처리 로직
     * 1. 쿠키에서 리프레시 토큰 추출
     * 2. 리프레시 토큰 검증
     * 3. 새로운 액세스 토큰 발급
     */
    private void processRefreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        if (refreshToken == null) {
            throw new GlobalException(AuthErrorCode.TOKEN_NOT_FOUND,
                    "리프레시 토큰이 쿠키에 존재하지 않습니다");
        }

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new GlobalException(AuthErrorCode.EXPIRED_REFRESH_TOKEN,
                    "리프레시 토큰이 만료되었습니다. 재로그인이 필요합니다");
        }

        String email = tokenProvider.getEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                        "인증 정보가 유효하지 않습니다"));

        String newAccessToken = tokenProvider.recreateAccessToken(user);
        response.setHeader("New-Access-Token", newAccessToken);
        setAuthentication(newAccessToken);
    }

    // 쿠키에서 리프레시 토큰 추출
    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REFRESH_TOKEN_COOKIE.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    // Spring Security Context에 인증 정보 설정
    private void setAuthentication(String token) {
        String email = tokenProvider.getEmail(token);
        Authentication auth = new UsernamePasswordAuthenticationToken(
                email, token, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // Authorization 헤더에서 Bearer 토큰 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // 에러 응답 설정
    private void setErrorResponse(HttpServletResponse response, GlobalException e)
        throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(e.getErrorCode().getStatus());

        ErrorResponse errorResponse = ErrorResponse.of(e.getErrorCode(), e.getDetail());
        CommonResponseDto<?> commonResponse = CommonResponseDto.error(errorResponse);

        response.getWriter().write(objectMapper.writeValueAsString(commonResponse));
    }
}