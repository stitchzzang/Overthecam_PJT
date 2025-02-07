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
     * 응원 점수 차감
     * - 잔여 점수 확인
     * - 점수 차감 로직
     */
    public void deductSupportScore(User user, int amount) {
        validateSufficientScore(user, amount);
        user.setSupportScore(user.getSupportScore() - amount);
    }

    /**
     * 응원 점수 추가
     * - 점수 누적 로직
     */
    public void addSupportScore(User user, int amount) {
        user.setSupportScore(user.getSupportScore() + amount);
    }

    /**
     * 응원 점수 충분 여부 검증
     */
    private void validateSufficientScore(User user, int amount) {
        if (user.getSupportScore() < amount) {
            throw new InsufficientSupportScoreException("응원 점수가 부족합니다");
        }
    }

    /**
     * 응원점수 부족 시 발생하는 예외
     */
    public static class InsufficientSupportScoreException extends RuntimeException {
        public InsufficientSupportScoreException(String message) {
            super(message);
        }
    }
}