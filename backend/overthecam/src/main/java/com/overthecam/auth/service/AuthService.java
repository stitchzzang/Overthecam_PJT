package com.overthecam.auth.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.dto.LoginRequest;
import com.overthecam.auth.dto.SignUpRequest;
import com.overthecam.auth.dto.TokenResponse;
import com.overthecam.auth.dto.UserResponse;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
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

    public CommonResponseDto<UserResponse> signup(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new GlobalException(ErrorCode.DUPLICATE_EMAIL, "Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .gender(request.getGender())
                .build();

        return CommonResponseDto.success(UserResponse.from(userRepository.save(user)));
    }

    public CommonResponseDto<TokenResponse> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        return CommonResponseDto.success(jwtTokenProvider.createToken(user.getEmail()));
    }

    public CommonResponseDto<Void> logout(String token) {
        // JWT 블랙리스트 처리 로직
        return CommonResponseDto.success(null);
    }
}