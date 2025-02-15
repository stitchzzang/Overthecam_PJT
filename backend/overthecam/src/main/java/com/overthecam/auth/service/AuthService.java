package com.overthecam.auth.service;

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
    private final TokenService tokenService;

    // 회원가입 - 중복 검사 후 비밀번호를 암호화하여 사용자 정보 저장
    public UserResponse signup(SignUpRequest request) {
        // 이메일 중복 검사
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new GlobalException(AuthErrorCode.DUPLICATE_EMAIL,
                    String.format("이미 등록된 이메일입니다: %s", request.getEmail()));
        }

        // 닉네임 중복 검사
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new GlobalException(AuthErrorCode.DUPLICATE_NICKNAME,
                    String.format("이미 등록된 닉네임입니다: %s", request.getNickname()));
        }

        // 전화번호 중복 검사
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new GlobalException(AuthErrorCode.DUPLICATE_PHONE_NUMBER,
                    String.format("이미 등록된 전화번호입니다: %s", request.getPhoneNumber()));
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
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                String.format("사용자를 찾을 수 없습니다: %s", request.getEmail())));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new GlobalException(AuthErrorCode.INVALID_PASSWORD,
                String.format("비밀번호가 일치하지 않습니다: %s", request.getEmail()));
        }

        TokenResponse tokenResponse = jwtTokenProvider.createToken(user);

        // Redis에 Refresh Token 저장
        tokenService.saveRefreshToken(
            user.getId(),
            tokenResponse.getRefreshToken(),
            tokenResponse.getAccessTokenExpiresIn()
        );

        return TokenResponse.builder()
            .accessToken(tokenResponse.getAccessToken())
            .refreshToken(tokenResponse.getRefreshToken())
            .grantType(tokenResponse.getGrantType())
            .accessTokenExpiresIn(tokenResponse.getAccessTokenExpiresIn())
            .userId(user.getId())
            .profileImage(user.getProfileImage())
            .nickname(user.getNickname())
            .build();
    }

    /**
     * 로그아웃 처리
     * 1. DB의 Refresh Token 삭제
     * 2. 쿠키의 Refresh Token 삭제
     */
    @Transactional
    public void logout(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == "anonymousUser") {
            throw new GlobalException(AuthErrorCode.LOGOUT_UNAUTHORIZED, "로그인된 사용자가 없습니다.");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        String accessToken = request.getHeader("Authorization");
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        } else {
            throw new GlobalException(AuthErrorCode.LOGOUT_TOKEN_NOT_FOUND, "로그아웃 처리할 토큰을 찾을 수 없습니다");
        }

        tokenService.logout(user.getId(), accessToken);
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
     * Access Token 갱신
     * 1. Refresh Token 유효성 검증
     * 2. DB의 Refresh Token과 비교
     * 3. 새로운 Access Token 발급
     */
    @Transactional
    public CommonResponseDto<TokenResponse> refreshAccessToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new GlobalException(AuthErrorCode.INVALID_TOKEN_SIGNATURE,
                "유효하지 않은 토큰입니다");
        }

        String email = jwtTokenProvider.getEmail(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                "사용자를 찾을 수 없습니다"));

        // Redis에서 Refresh Token 검증
        if (!tokenService.validateRefreshToken(user.getId(), refreshToken)) {
            throw new GlobalException(AuthErrorCode.INVALID_TOKEN_SIGNATURE,
                "유효하지 않은 토큰입니다");
        }

        String newAccessToken = jwtTokenProvider.recreateAccessToken(user);
        TokenResponse tokenResponse = TokenResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(refreshToken)
            .grantType("Bearer")
            .accessTokenExpiresIn(System.currentTimeMillis() + 1800000)
            .build();

        return CommonResponseDto.ok(tokenResponse);
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

        // Redis에 Refresh Token 저장
        tokenService.saveRefreshToken(
            user.getId(),
            tokenResponse.getRefreshToken(),
            tokenResponse.getAccessTokenExpiresIn()
        );

        return tokenResponse;
    }
}