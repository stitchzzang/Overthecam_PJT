package com.overthecam.auth.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.dto.LoginRequest;
import com.overthecam.auth.dto.SignUpRequest;
import com.overthecam.auth.dto.TokenResponse;
import com.overthecam.auth.dto.UserResponse;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.auth.security.JwtTokenProvider;
import com.overthecam.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.exception.GlobalException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 회원가입 - 이메일 중복 검사 후 비밀번호를 암호화하여 사용자 정보 저장
    public CommonResponseDto<UserResponse> signup(SignUpRequest request) {
        // 이메일 중복 검사
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new GlobalException(ErrorCode.DUPLICATE_EMAIL,
                    String.format("이미 등록된 이메일입니다: %s", request.getEmail()));
        }

        // 비밀번호 암호화 후 사용자 저장
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .gender(request.getGender())
                .birth(request.getBirth())
                .phoneNumber(request.getPhoneNumber())
                .build();

        User savedUser = userRepository.save(user);
        return CommonResponseDto.success("회원가입이 완료되었습니다",
                UserResponse.from(savedUser));
    }

    /**
     * 로그인 처리
     * 1. 이메일로 사용자 조회
     * 2. 비밀번호 검증
     * 3. 토큰 발급
     * 4. Refresh Token을 DB와 쿠키에 저장
     */
    @Transactional
    public CommonResponseDto<TokenResponse> login(
            LoginRequest request, HttpServletResponse response) {

        // 사용자 조회 및 비밀번호 검증
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND,
                        String.format("사용자를 찾을 수 없습니다: %s", request.getEmail())));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new GlobalException(ErrorCode.INVALID_PASSWORD,
                    String.format("비밀번호가 일치하지 않습니다: %s", request.getEmail()));
        }

        // 토큰 발급 및 저장
        TokenResponse tokenResponse = jwtTokenProvider.createToken(user);
        user.updateRefreshToken(tokenResponse.getRefreshToken());

        // Refresh Token을 쿠키에 저장
        Cookie refreshTokenCookie = new Cookie("refresh_token",
                tokenResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(60 * 60 * 24 * 7);
        response.addCookie(refreshTokenCookie);

        return CommonResponseDto.success("로그인이 완료되었습니다", tokenResponse);
    }

    /**
     * Access Token 갱신
     * 1. Refresh Token 유효성 검증
     * 2. DB의 Refresh Token과 비교
     * 3. 새로운 Access Token 발급
     */
    @Transactional
    public CommonResponseDto<TokenResponse> refreshAccessToken(
            String refreshToken, HttpServletResponse response) {
        // Refresh Token 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new GlobalException(ErrorCode.INVALID_TOKEN,
                    "유효하지 않은 토큰입니다");
        }

        // 사용자 조회 및 토큰 비교
        String email = jwtTokenProvider.getEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND,
                        "사용자를 찾을 수 없습니다"));

        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(refreshToken)) {
            throw new GlobalException(ErrorCode.INVALID_TOKEN,
                    "유효하지 않은 토큰입니다");
        }


        // 새로운 Access Token 발급
        String newAccessToken = jwtTokenProvider.recreateAccessToken(user);
        TokenResponse tokenResponse = TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .grantType("Bearer")
                .accessTokenExpiresIn(System.currentTimeMillis() + 1800000)
                .build();

        response.setHeader("New-Access-Token", newAccessToken);
        return CommonResponseDto.success("토큰이 갱신되었습니다", tokenResponse);
    }

    /**
     * 로그아웃 처리
     * 1. Access Token 검증
     * 2. DB의 Refresh Token 제거
     * 3. 쿠키의 Refresh Token 제거
     */
    @Transactional
    public CommonResponseDto<Void> logout(String token, HttpServletResponse response) {
        // Bearer 토큰 형식 검증
        if (token == null || !token.startsWith("Bearer ")) {
            throw new GlobalException(ErrorCode.INVALID_TOKEN, "유효하지 않은 토큰 형식입니다");
        }

        // 토큰 추출 및 유효성 검증
        String accessToken = token.substring(7);
        if (!jwtTokenProvider.validateToken(accessToken)) {
            throw new GlobalException(ErrorCode.INVALID_TOKEN, "유효하지 않은 토큰입니다");
        }

        // 토큰에서 사용자 이메일 추출 후 사용자 조회
        String email = jwtTokenProvider.getEmail(accessToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));

        // DB에서 Refresh Token 제거
        user.clearRefreshToken();
        userRepository.save(user);

        // 쿠키에서 Refresh Token 제거
        Cookie refreshTokenCookie = new Cookie("refresh_token", null);
        refreshTokenCookie.setPath("/");        // 모든 경로에서 접근 가능하도록 설정
        refreshTokenCookie.setMaxAge(0);        // 쿠키 즉시 만료
        refreshTokenCookie.setHttpOnly(true);   // JavaScript에서 접근 불가능하도록 설정
        refreshTokenCookie.setSecure(true);     // HTTPS에서만 전송되도록 설정
        response.addCookie(refreshTokenCookie);

        return CommonResponseDto.success("로그아웃이 완료되었습니다", null);
    }
}