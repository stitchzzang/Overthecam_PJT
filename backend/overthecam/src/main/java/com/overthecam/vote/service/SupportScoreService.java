package com.overthecam.vote.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class SupportScoreService {
    private final UserRepository userRepository;

    /**
    * 유저의 응원점수 차감
     */
    public void deductSupportScore(User user, int amount) {
        // 1. 잔여 점수 확인
        if (user.getSupportScore() < amount) {
            throw new InsufficientSupportScoreException("응원 점수가 부족합니다");
        }
        // 2. 점수 차감
        user.setSupportScore(user.getSupportScore() - amount);
    }

    /**
     * 유저의 응원점수 추가
     */
    public void addSupportScore(User user, int amount) {
        user.setSupportScore(user.getSupportScore() + amount);
    }

    // 커스텀 예외 클래스 정의: 응원점수가 부족할 때
    public static class InsufficientSupportScoreException extends RuntimeException {
        public InsufficientSupportScoreException(String message) {
            super(message);
        }
    }
}