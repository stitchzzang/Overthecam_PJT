package com.overthecam.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String accessToken = resolveToken(request);

        if (accessToken != null) {
            if (tokenProvider.validateToken(accessToken)) {
                setAuthentication(accessToken);
            } else if (tokenProvider.isExpiredToken(accessToken)) {
                String refreshToken = request.getHeader("Refresh-Token");
                if (refreshToken != null && tokenProvider.validateToken(refreshToken)) {
                    String email = tokenProvider.getEmail(refreshToken);
                    String newAccessToken = tokenProvider.recreateAccessToken(email);
                    response.setHeader("New-Access-Token", newAccessToken);
                    setAuthentication(newAccessToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(String token) {
        String email = tokenProvider.getEmail(token);
        Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}