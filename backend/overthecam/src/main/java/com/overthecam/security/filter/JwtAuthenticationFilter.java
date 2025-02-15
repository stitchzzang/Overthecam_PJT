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
import io.jsonwebtoken.ExpiredJwtException;
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
            String accessToken = resolveToken(request);

            // permitAll 경로이면서 토큰이 없는 경우 -> 그냥 통과
            if (isPermitAllEndpoint(request.getRequestURI()) && accessToken == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // 토큰이 있는 경우 -> permitAll 경로여도 토큰 검증 진행
            if (accessToken != null) {
                try {
                    if (tokenProvider.validateToken(accessToken)) {
                        setAuthentication(accessToken);
                    }
                } catch (ExpiredJwtException e) {
                    throw new GlobalException(AuthErrorCode.EXPIRED_ACCESS_TOKEN,
                        "액세스 토큰이 만료되었습니다. 토큰을 갱신해주세요.");
                }
            } else if (!isPermitAllEndpoint(request.getRequestURI())) {
                // permitAll 아닌 경로인데 토큰이 없는 경우
                throw new GlobalException(AuthErrorCode.TOKEN_NOT_FOUND,
                    "인증 토큰이 필요합니다");
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
    private void processToken(String accessToken) {
        if (accessToken != null) {
            // 토큰이 만료되었으면 401 에러를 던집니다
            if (tokenProvider.isExpiredToken(accessToken)) {
                throw new GlobalException(AuthErrorCode.EXPIRED_ACCESS_TOKEN,
                    "액세스 토큰이 만료되었습니다. 토큰을 갱신해주세요.");
            }

            // 토큰이 유효하면 인증 정보를 설정합니다
            if (tokenProvider.validateToken(accessToken)) {
                setAuthentication(accessToken);
            } else {
                throw new GlobalException(AuthErrorCode.INVALID_TOKEN_SIGNATURE,
                    "토큰의 서명이 유효하지 않습니다");
            }
        }
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