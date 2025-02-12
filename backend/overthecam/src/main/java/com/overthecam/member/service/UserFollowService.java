package com.overthecam.member.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.member.dto.FollowStatsInfo;
import com.overthecam.member.exception.FollowErrorCode;
import com.overthecam.member.domain.UserFollow;
import com.overthecam.member.dto.FollowResponse;
import com.overthecam.member.dto.UserProfileInfo;
import com.overthecam.member.repository.UserFollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserFollowService {
    private final UserFollowRepository userFollowRepository;
    private final UserRepository userRepository;

    public FollowResponse follow(Long userId, Long targetId) {
        if (userId.equals(targetId)) {
            throw new GlobalException(FollowErrorCode.SELF_FOLLOW_NOT_ALLOWED,
                    "사용자 ID: " + userId + " 자기 자신을 팔로우 시도");
        }

        User follower = findUserById(userId, "팔로워");
        User following = findUserById(targetId, "팔로잉 대상");

        if (userFollowRepository.existsByFollowerAndFollowing(follower, following)) {
            throw new GlobalException(FollowErrorCode.ALREADY_FOLLOWING,
                    "사용자 ID: " + userId + "가 이미 대상 ID: " + targetId + "를 팔로우하고 있습니다");
        }

        UserFollow userFollow = UserFollow.builder()
                .follower(follower)
                .following(following)
                .build();

        UserFollow saved = userFollowRepository.save(userFollow);
        return FollowResponse.builder()
                .followerId(saved.getFollower().getId())
                .followingId(saved.getFollowing().getId())
                .build();
    }

    public FollowResponse unfollow(Long userId, Long targetId) {
        User follower = findUserById(userId, "팔로워");
        User following = findUserById(targetId, "팔로잉 대상");

        UserFollow userFollow = userFollowRepository.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> new GlobalException(FollowErrorCode.FOLLOW_NOT_FOUND,
                        "사용자 ID: " + userId + "와 대상 ID: " + targetId + " 사이의 팔로우 관계가 존재하지 않습니다"));

        UserFollow deleted = userFollow;
        userFollowRepository.delete(userFollow);

        return FollowResponse.builder()
                .followerId(deleted.getFollower().getId())
                .followingId(deleted.getFollowing().getId())
                .build();
    }

    private User findUserById(Long userId, String userType) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND,
                        userType + " ID: " + userId + "를 찾을 수 없습니다"));
    }

    // 팔로잉 목록 조회 (내 것이든 다른 사람 것이든)
    public List<UserProfileInfo> getFollowingList(Long targetUserId, Long currentUserId) {
        return userFollowRepository.findFollowingListWithStatus(targetUserId, currentUserId);
    }

    // 팔로워 목록 조회 (내 것이든 다른 사람 것이든)
    public List<UserProfileInfo> getFollowerList(Long targetUserId, Long currentUserId) {
        return userFollowRepository.findFollowerListWithStatus(targetUserId, currentUserId);
    }

    // 팔로우 통계 조회
    public FollowStatsInfo getFollowStats(Long userId) {
        // 해당 유저가 존재하는지 확인
        findUserById(userId, "사용자");

        long followerCount = userFollowRepository.countFollowersByUserId(userId);
        long followingCount = userFollowRepository.countFollowingsByUserId(userId);

        return FollowStatsInfo.builder()
                .userId(userId)
                .followerCount(followerCount)
                .followingCount(followingCount)
                .build();
    }

}