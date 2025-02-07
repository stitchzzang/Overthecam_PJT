package com.overthecam.websocket.service;

import com.overthecam.auth.repository.UserRepository;
import com.overthecam.exception.websocket.WebSocketErrorCode;
import com.overthecam.exception.websocket.WebSocketException;
import com.overthecam.member.dto.UserScoreInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserScoreService {
    private final UserRepository userRepository;

    public UserScoreInfo getUserScore(Long userId) {
        return userRepository.findUserScores(userId);
    }

    @Transactional
    public UserScoreInfo updateSupportScore(Long userId, Integer score) {
        UserScoreInfo userScoreInfo = userRepository.findUserScores(userId);
        int newScore = userScoreInfo.getSupportScore() - score;
        if (newScore < 0) {
            throw new WebSocketException(WebSocketErrorCode.INSUFFICIENT_SCORE, "응원 점수가 부족합니다.");
        }
        userRepository.updateSupportScore(userId, newScore);
        return UserScoreInfo.updateSupportScore(newScore);
    }

    @Transactional
    public UserScoreInfo updatePoints(Long userId, Integer points) {
        UserScoreInfo userScoreInfo = userRepository.findUserScores(userId);
        int newPoints = userScoreInfo.getPoint() - points;
        if (newPoints < 0) {
            throw new WebSocketException(WebSocketErrorCode.INSUFFICIENT_POINTS, "포인트가 부족합니다.");
        }
        userRepository.updatePoint(userId, newPoints);
        return UserScoreInfo.updatePoints(newPoints);
    }
}
