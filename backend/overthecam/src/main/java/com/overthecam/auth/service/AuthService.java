package com.overthecam.auth.service;

import com.overthecam.auth.domain.DefaultProfileImage;
import com.overthecam.auth.domain.User;
import com.overthecam.auth.dto.*;
import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenService tokenService;

    /**
     * 회원가입 처리
     */
    public UserResponse signup(SignUpRequest request) {
        validateSignupRequest(request);

        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .nickname(request.getNickname())
            .profileImage(DefaultProfileImage.getRandomProfileUrl())
            .username(request.getUsername())
            .gender(request.getGender())
            .birth(request.getBirth())
            .phoneNumber(request.getPhoneNumber())
            .build();

        User savedUser = userRepository.save(user);
        log.info("회원가입 완료 - User ID: {}, Email: {}", savedUser.getId(), savedUser.getEmail());

        return UserResponse.from(savedUser);
    }

    private void validateSignupRequest(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new GlobalException(AuthErrorCode.DUPLICATE_EMAIL,
                String.format("이미 등록된 이메일입니다: %s", request.getEmail()));
        }

        if (userRepository.existsByNickname(request.getNickname())) {
            throw new GlobalException(AuthErrorCode.DUPLICATE_NICKNAME,
                String.format("이미 등록된 닉네임입니다: %s", request.getNickname()));
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new GlobalException(AuthErrorCode.DUPLICATE_PHONE_NUMBER,
                String.format("이미 등록된 전화번호입니다: %s", request.getPhoneNumber()));
        }
    }

    /**
     * 로그인 처리
     */
    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                String.format("사용자를 찾을 수 없습니다: %s", request.getEmail())));

        validatePassword(request.getPassword(), user);

        // 토큰 생성
        TokenResponse tokenResponse = jwtTokenProvider.createToken(user);

        // 새로운 로그인 처리 (기존 토큰 무효화 포함)
        boolean hadExistingSession = tokenService.handleNewLogin(
            user.getId(),
            tokenResponse.getRefreshToken(),
            tokenResponse.getAccessToken(),
            tokenResponse.getAccessTokenExpiresIn()
        );

        TokenResponse response = buildTokenResponse(tokenResponse, user);
        if (hadExistingSession) {
            response.updateSessionInfo(true);
        }

        log.info("로그인 성공 - User ID: {}, Email: {}, 기존 세션 종료: {}",
            user.getId(), user.getEmail(), hadExistingSession);

        return response;
    }

    private void validatePassword(String rawPassword, User user) {
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            log.warn("비밀번호 불일치 - Email: {}", user.getEmail());
            throw new GlobalException(AuthErrorCode.INVALID_PASSWORD, "비밀번호가 일치하지 않습니다");
        }
    }

    private TokenResponse buildTokenResponse(TokenResponse tokenResponse, User user) {
        return TokenResponse.builder()
            .accessToken(tokenResponse.getAccessToken())
            .refreshToken(tokenResponse.getRefreshToken())
            .grantType(tokenResponse.getGrantType())
            .accessTokenExpiresIn(tokenResponse.getAccessTokenExpiresIn())
            .userId(user.getId())
            .profileImage(user.getProfileImage())
            .nickname(user.getNickname())
            .point(user.getPoint())
            .supportScore(user.getSupportScore())
            .build();
    }

    /**
     * 로그아웃 처리
     */
    @Transactional
    public void logout(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        validateLogoutAuthentication(authentication);

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        String accessToken = extractAccessToken(request);
        tokenService.logout(user.getId(), accessToken);
        SecurityContextHolder.clearContext();

        log.info("로그아웃 완료 - User ID: {}, Email: {}", user.getId(), email);
    }

    private void validateLogoutAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == "anonymousUser") {
            throw new GlobalException(AuthErrorCode.LOGOUT_UNAUTHORIZED, "로그인된 사용자가 없습니다");
        }
    }

    private String extractAccessToken(HttpServletRequest request) {
        String accessToken = request.getHeader("Authorization");
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            return accessToken.substring(7);
        }
        throw new GlobalException(AuthErrorCode.LOGOUT_TOKEN_NOT_FOUND, "로그아웃 처리할 토큰을 찾을 수 없습니다");
    }

    /**
     * Access Token 갱신
     */
    @Transactional
    public CommonResponseDto<TokenResponse> refreshAccessToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        validateRefreshToken(refreshToken);

        String email = jwtTokenProvider.getEmail(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        validateStoredRefreshToken(user.getId(), refreshToken);

        String newAccessToken = jwtTokenProvider.recreateAccessToken(user);
        long expirationTime = System.currentTimeMillis() + 1800000;

        // 기존 토큰 삭제하고 새 토큰 저장
        tokenService.updateAccessToken(user.getId(), newAccessToken, expirationTime);

        TokenResponse tokenResponse = TokenResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(refreshToken)
            .grantType("Bearer")
            .accessTokenExpiresIn(expirationTime)
            .build();

        log.info("Access Token 갱신 완료 - User ID: {}, Email: {}", user.getId(), email);

        return CommonResponseDto.ok(tokenResponse);
    }

    private void validateRefreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new GlobalException(AuthErrorCode.INVALID_TOKEN_SIGNATURE, "유효하지 않은 토큰입니다");
        }
    }

    private void validateStoredRefreshToken(Long userId, String refreshToken) {
        if (!tokenService.validateRefreshToken(userId, refreshToken)) {
            throw new GlobalException(AuthErrorCode.INVALID_TOKEN_SIGNATURE, "유효하지 않은 토큰입니다");
        }
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
     * 비밀번호 재설정 검증
     */
    @Transactional(readOnly = true)
    public CommonResponseDto<Void> verifyPasswordReset(VerifyPasswordResetRequest request) {
        userRepository.findByEmailAndUsernameAndPhoneNumber(
                request.getEmail(),
                request.getUsername(),
                request.getPhoneNumber())
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                String.format("일치하는 사용자 정보가 없습니다. (이메일: %s)", request.getEmail())));

        return CommonResponseDto.ok();
    }

    /**
     * 비밀번호 재설정
     */
    @Transactional
    public TokenResponse resetPassword(ResetPasswordRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                String.format("사용자를 찾을 수 없습니다. (이메일: %s)", request.getEmail())));

        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        TokenResponse tokenResponse = jwtTokenProvider.createToken(user);
        tokenService.handleNewLogin(
            user.getId(),
            tokenResponse.getRefreshToken(),
            tokenResponse.getAccessToken(),
            tokenResponse.getAccessTokenExpiresIn()
        );

        log.info("비밀번호 재설정 완료 - User ID: {}, Email: {}", user.getId(), user.getEmail());

        return tokenResponse;
    }
}