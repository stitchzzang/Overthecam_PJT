package com.overthecam.auth.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.dto.*;
import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 회원가입 - 이메일 중복 검사 후 비밀번호를 암호화하여 사용자 정보 저장
    public UserResponse signup(SignUpRequest request) {
        // 이메일 중복 검사
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new GlobalException(AuthErrorCode.DUPLICATE_EMAIL,
                    String.format("이미 등록된 이메일입니다: %s", request.getEmail()));
        }

        // 비밀번호 암호화 후 사용자 저장
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .profileImage("https://d26tym50939cjl.cloudfront.net/profiles/profile_person.jpg")
                .username(request.getUsername())
                .gender(request.getGender())
                .birth(request.getBirth())
                .phoneNumber(request.getPhoneNumber())
                .build();

        User savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }

    /**
     * 로그인 처리
     * 1. 이메일로 사용자 조회
     * 2. 비밀번호 검증
     * 3. 토큰 발급
     * 4. Refresh Token을 DB와 쿠키에 저장
     */
    @Transactional
    public TokenResponse login(
            LoginRequest request, HttpServletResponse response) {

        // 사용자 조회 및 비밀번호 검증
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                        String.format("사용자를 찾을 수 없습니다: %s", request.getEmail())));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new GlobalException(AuthErrorCode.INVALID_PASSWORD,
                    String.format("비밀번호가 일치하지 않습니다: %s", request.getEmail()));
        }

        // 토큰 발급 및 저장
        TokenResponse tokenResponse = jwtTokenProvider.createToken(user);


        TokenResponse enrichedTokenResponse = TokenResponse.builder()
                .accessToken(tokenResponse.getAccessToken())
                .refreshToken(tokenResponse.getRefreshToken())
                .grantType(tokenResponse.getGrantType())
                .accessTokenExpiresIn(tokenResponse.getAccessTokenExpiresIn())
                .userId(user.getId())
                .profileImage(user.getProfileImage())
                .nickname(user.getNickname())
                .build();

        user.updateRefreshToken(enrichedTokenResponse.getRefreshToken());

        // Refresh Token을 쿠키에 저장
        Cookie refreshTokenCookie = new Cookie("refresh_token",
                enrichedTokenResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(60 * 60 * 24 * 7);
        response.addCookie(refreshTokenCookie);

        return enrichedTokenResponse;
    }

    /**
     * 로그아웃 처리
     * 1. DB의 Refresh Token 삭제
     * 2. 쿠키의 Refresh Token 삭제
     */
    @Transactional
    public void logout(HttpServletResponse response) {
        // 현재 인증된 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == "anonymousUser") {
            throw new GlobalException(AuthErrorCode.USER_NOT_FOUND, "로그인된 사용자가 없습니다.");
        }

        // 토큰에서 사용자 이메일 추출 후 사용자 조회
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        // DB에서 Refresh Token 제거
        user.clearRefreshToken();
        userRepository.save(user);

        // 쿠키에서 Refresh Token 제거
        Cookie refreshTokenCookie = new Cookie("refresh_token", null);
        refreshTokenCookie.setPath("/");        // 모든 경로에서 접근 가능하도록 설정
        refreshTokenCookie.setMaxAge(0);        // 쿠키 즉시 만료
        refreshTokenCookie.setHttpOnly(true);   // JavaScript에서 접근 불가능하도록 설정
        refreshTokenCookie.setSecure(false);    // HTTPS 환경이 아니면 false
        response.addCookie(refreshTokenCookie);

        // SecurityContext 초기화 (로그아웃 효과)
        SecurityContextHolder.clearContext();
    }

    /**
     * 이메일 찾기
     * - 이름과 전화번호로 사용자 확인
     */
    @Transactional(readOnly = true)
    public UserResponse findEmail(FindEmailRequest request) {
        User user = userRepository.findByUsernameAndPhoneNumberAndBirth(
                        request.getUsername(),
                        request.getPhoneNumber(),
                        request.getBirth())
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                        String.format("일치하는 사용자 정보가 없습니다. (이름: %s)", request.getUsername())));

        return UserResponse.from(user);
    }

    /**
     * 비밀번호 재설정을 위한 사용자 확인 (1단계)
     * - 이메일, 이름, 전화번호로 사용자 검증
     */
    @Transactional(readOnly = true)
    public void verifyPasswordReset(VerifyPasswordResetRequest request) {
        User user = userRepository.findByEmailAndUsernameAndPhoneNumber(
                        request.getEmail(),
                        request.getUsername(),
                        request.getPhoneNumber())
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                        String.format("일치하는 사용자 정보가 없습니다. (이메일: %s)", request.getEmail())));
    }

    /**
     * 새 비밀번호 설정 (2단계)
     * 1. 이메일로 사용자 조회
     * 2. 새 비밀번호 암호화 및 업데이트
     * 3. 토큰 발급
     * 4. Refresh Token을 DB와 쿠키에 저장
     */
    @Transactional
    public TokenResponse resetPassword(ResetPasswordRequest request, HttpServletResponse response) {
        // 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                        String.format("사용자를 찾을 수 없습니다. (이메일: %s)", request.getEmail())));

        // 비밀번호 업데이트
        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 토큰 발급 및 저장 (자동 로그인)
        TokenResponse tokenResponse = jwtTokenProvider.createToken(user);
        user.updateRefreshToken(tokenResponse.getRefreshToken());

        // Refresh Token을 쿠키에 저장
        Cookie refreshTokenCookie = new Cookie("refresh_token", tokenResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(60 * 60 * 24 * 7); // 7일
        response.addCookie(refreshTokenCookie);

        return tokenResponse;
    }
}