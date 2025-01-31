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

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public CommonResponseDto<UserResponse> signup(SignUpRequest request) {
        // 1. 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new GlobalException(ErrorCode.DUPLICATE_EMAIL,
                    String.format("이미 등록된 이메일입니다: %s", request.getEmail()));
        }

        // 2. 사용자 엔티티 생성
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .gender(request.getGender())
                .build();

        // 3. 사용자 저장 및 응답
        User savedUser = userRepository.save(user);
        return CommonResponseDto.success("회원가입이 완료되었습니다", UserResponse.from(savedUser));
    }

    public CommonResponseDto<TokenResponse> login(LoginRequest request) {
        // 1. 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND,
                        String.format("사용자를 찾을 수 없습니다: %s", request.getEmail())));

        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new GlobalException(ErrorCode.INVALID_PASSWORD,
                    String.format("비밀번호가 일치하지 않습니다: %s", request.getEmail()));
        }

        // 3. 토큰 생성 및 응답
        TokenResponse tokenResponse = jwtTokenProvider.createToken(user);
        return CommonResponseDto.success("로그인이 완료되었습니다", tokenResponse);
    }

    public CommonResponseDto<Void> logout(String token) {
        // 1. 토큰 형식 검증
        if (token == null || !token.startsWith("Bearer ")) {
            throw new GlobalException(ErrorCode.INVALID_TOKEN, "유효하지 않은 토큰 형식입니다");
        }

        // 2. 토큰 유효성 검사
        String accessToken = token.substring(7);
        if (!jwtTokenProvider.validateToken(accessToken)) {
            throw new GlobalException(ErrorCode.INVALID_TOKEN, "유효하지 않은 토큰입니다");
        }

        // JWT 블랙리스트 처리 로직 추가 가능
        return CommonResponseDto.success("로그아웃이 완료되었습니다", null);
    }
}