package com.overthecam.auth.security;
// 모든 요청에 대한 JWT 토큰 검증

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.exception.ErrorCode;
import com.overthecam.exception.GlobalException;
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
            // 1. Authorization 헤더에서 토큰 추출
            String accessToken = resolveToken(request);

            // 2. 토큰 검증 및 처리
            processToken(accessToken, request, response);

            // 3. 다음 필터로 진행
            filterChain.doFilter(request, response);
        } catch (GlobalException e) {
            // 인증 오류 발생 시 에러 응답 설정
            log.error("인증 오류: {}", e.getMessage());
            setErrorResponse(response, e);
        }
    }

    /**
     * 토큰 처리 로직
     * 1. 토큰 유효성 검증
     * 2. 만료된 경우 리프레시 토큰으로 갱신
     */
    private void processToken(String accessToken, HttpServletRequest request,
                              HttpServletResponse response) {
        if (accessToken != null) {
            if (tokenProvider.isExpiredToken(accessToken)) {
                // 만료된 토큰인 경우 리프레시 토큰으로 갱신 시도
                processRefreshToken(request, response);
            }
            if (tokenProvider.validateToken(accessToken)) {
                // 유효한 토큰인 경우 인증 정보 설정
                setAuthentication(accessToken);
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
        // 쿠키에서 리프레시 토큰 추출
        String refreshToken = extractRefreshTokenFromCookie(request);

        if (refreshToken != null && tokenProvider.validateToken(refreshToken)) {
            // 리프레시 토큰이 유효한 경우
            String email = tokenProvider.getEmail(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND,
                            "인증 정보가 유효하지 않습니다"));

            // 새로운 액세스 토큰 발급
            String newAccessToken = tokenProvider.recreateAccessToken(user);
            response.setHeader("New-Access-Token", newAccessToken);
            setAuthentication(newAccessToken);
        } else {
            throw new GlobalException(ErrorCode.EXPIRED_TOKEN, "재로그인이 필요합니다");
        }
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
                email, null, Collections.emptyList());
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
        response.setStatus(e.getHttpStatus().value());
        CommonResponseDto<?> errorResponse = CommonResponseDto.error(e.getErrorCode());
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}