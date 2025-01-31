package com.overthecam.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.exception.ErrorCode;
import com.overthecam.exception.GlobalException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // 요청당 한 번만 실행되는 JWT 인증 필터
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. 토큰 추출
            String accessToken = resolveToken(request);
            // 2. 토큰 검증 및 처리
            processToken(accessToken, request, response);
            // 3. 다음 필터 체인 진행
            filterChain.doFilter(request, response);
        } catch (GlobalException e) {
            // 인증 중 에러 발생 시 에러 응답 설정
            log.error("JWT Authentication error: {}", e.getDetail());
            setErrorResponse(response, e);
        }
    }

    // 토큰 처리 로직
    private void processToken(String accessToken, HttpServletRequest request, HttpServletResponse response) {
        if (accessToken != null) {
            if (tokenProvider.validateToken(accessToken)) {
                // 유효한 토큰: 인증 설정
                setAuthentication(accessToken);
            } else if (tokenProvider.isExpiredToken(accessToken)) {
                // 만료된 토큰: 리프레시 토큰으로 새 토큰 발급
                processRefreshToken(request, response);
            }
        }
    }

    private void processRefreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = request.getHeader("Refresh-Token");
        if (refreshToken != null && tokenProvider.validateToken(refreshToken)) {
            String email = tokenProvider.getEmail(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));
            String newAccessToken = tokenProvider.recreateAccessToken(user);
            response.setHeader("New-Access-Token", newAccessToken);
            setAuthentication(newAccessToken);
        } else {
            throw new GlobalException(ErrorCode.EXPIRED_TOKEN, "토큰이 만료되었습니다");
        }
    }

    private void setErrorResponse(HttpServletResponse response, GlobalException e) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(e.getHttpStatus().value());
        CommonResponseDto<?> errorResponse = CommonResponseDto.error(e.getErrorCode());
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    private void setAuthentication(String token) {
        String email = tokenProvider.getEmail(token);
        Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    // 요청 헤더에서 Bearer 토큰 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}