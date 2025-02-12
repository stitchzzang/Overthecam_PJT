package com.overthecam.member.service;

import com.overthecam.auth.repository.UserRepository;
import com.overthecam.member.dto.UserScoreInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserScoreService {
    private final UserRepository userRepository;

    public Optional<UserScoreInfo> getUserScore(Long userId) {
        return userRepository.findScoreAndPointByUserId(userId);
    }

}
