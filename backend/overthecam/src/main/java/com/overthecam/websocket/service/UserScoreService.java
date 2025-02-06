package com.overthecam.websocket.service;

import com.overthecam.auth.repository.UserRepository;
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
        userRepository.updateSupportScore(userId, score);
        return UserScoreInfo.updateSupportScore(score);
    }

    @Transactional
    public UserScoreInfo updatePoints(Long userId, Integer points) {
        userRepository.updatePoint(userId, points);
        return UserScoreInfo.updatePoints(points);
    }
}
