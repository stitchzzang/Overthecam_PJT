package com.overthecam.member.service;

import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.common.exception.GlobalErrorCode;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.member.exception.UserErrorCode;
import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;
import com.overthecam.member.dto.UserScoreInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserScoreService {
    private final UserRepository userRepository;

    public Optional<UserScoreInfo> getUserScore(Long userId) {
        return userRepository.findScoreAndPointByUserId(userId);
    }

    @Transactional
    public UserScoreInfo updateSupportScore(Long userId, Integer score) {
        return userRepository.findScoreAndPointByUserId(userId)
                .map(userScore -> {
                    int newScore = userScore.getSupportScore() - score;
                    if (newScore < 0) {
                        throw new GlobalException(UserErrorCode.INSUFFICIENT_SCORE, "응원 점수가 부족합니다.");
                    }

                    // 낙관적 락 사용
                    int updatedRows = userRepository.updateSupportScoreWithOptimisticLock(
                            userId, newScore, userScore.getSupportScore());

                    if (updatedRows == 0) {
                        throw new GlobalException(GlobalErrorCode.CONCURRENT_UPDATE, "다른 트랜잭션에 의해 데이터가 변경되었습니다");
                    }

                    return UserScoreInfo.updateSupportScore(newScore);
                })
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }

    @Transactional
    public UserScoreInfo updatePoints(Long userId, Integer points) {
        UserScoreInfo userScoreInfo = userRepository.findScoreAndPointByUserId(userId).get();
        int newPoints = userScoreInfo.getPoint() - points;
        if (newPoints < 0) {
            throw new GlobalException(UserErrorCode.INSUFFICIENT_POINT, "포인트가 부족합니다.");
        }
        userRepository.updatePoint(userId, newPoints);
        return UserScoreInfo.updatePoints(newPoints);
    }
}
