package com.overthecam.member.service;

import com.overthecam.auth.repository.UserRepository;
import com.overthecam.member.dto.UserScoreInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MyPageService {

    private final UserRepository userRepository;

    //100점당 1점
    public UserScoreInfo revertScoreToPoint(Long userId, int amount) {
        // 기존 유저의 웅원 점수 조회
        int currentSupportScore = getUserSupportScore(userId);

        // 기존 유저의 포인트 점수 조회
        int currentPoints = getUserPoints(userId);

        // 응원 점수가 1000점 이하면 변환 불가
        if (currentSupportScore < 1000) {
            return new UserScoreInfo(currentSupportScore, 0); // 변환 불가
        }

        // 변환 로직: 1000점당 100 포인트
        int convertedPoints = amount / 10; //2000이면 200만큼을 전환

        int remainingPoints = currentPoints + convertedPoints; //뱐환된 점수 = 기존 점수 + 변환된 점수
        int remainingSupportScore = currentSupportScore - amount;

        updateUserScore(userId, remainingSupportScore);
        updateUserPoints(userId, remainingPoints);

        return new UserScoreInfo(remainingSupportScore, remainingPoints);


    }

    private void updateUserPoints(Long userId, int newPoints) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setPoint(user.getPoint() + newPoints);
            userRepository.save(user);
        });
    }

    private int getUserPoints(Long userId) {
        return userRepository.findById(userId)
                .map(user -> user.getPoint())
                .orElse(0);
    }

    private int getUserSupportScore(Long userId) {
        return userRepository.findById(userId)
                .map(user -> user.getSupportScore())
                .orElse(0);
    }

    private void updateUserScore(Long userId, int newScore) {
        userRepository.findById(userId).ifPresent(user -> {
            user.updateSupportScores(newScore);
            userRepository.save(user);
        });
    }
}
