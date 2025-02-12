package com.overthecam.member.controller;

import com.overthecam.auth.domain.User;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.member.dto.*;
import com.overthecam.member.service.BattleHIstoryService;
import com.overthecam.member.service.MyPageService;
import com.overthecam.member.service.UserFollowService;
import com.overthecam.member.service.UserScoreService;
import com.overthecam.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final SecurityUtils securityUtils;
    private final MyPageService myPageService;
    private final BattleHIstoryService battleHIstoryService;
    private final UserScoreService userScoreService;
    private final UserFollowService userFollowService;


    @GetMapping("/revert")
    public CommonResponseDto<UserScoreInfo> revertScoreToPoint(Authentication authentication, @RequestParam("supportScore") int supportScore) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.ok(myPageService.revertScoreToPoint(userId, supportScore));
    }

    @GetMapping("/battle/history")
    public CommonResponseDto<?> battleHistory(Authentication authentication,
                                              @RequestParam(value = "userId", required = false) Long targetUserId) {
        Long userId = targetUserId != null ?
                targetUserId :
                securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.ok(battleHIstoryService.findBattleHistoryViewByUserId(userId));
    }

    @GetMapping("/stats")
    public CommonResponseDto<UserCombinedStatsDto> getUserStats(
            Authentication authentication,
            @RequestParam(value = "userId", required = false) Long targetUserId) {

        Long currentUserId = securityUtils.getCurrentUserId(authentication);
        Long userId = targetUserId != null ? targetUserId : currentUserId;

        User user = userFollowService.findUserById(userId, "사용자");
        boolean isFollowing = userId.equals(currentUserId) ? false :
                userFollowService.isFollowing(currentUserId, userId);

        UserProfileInfo profileInfo = UserProfileInfo.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .follow(isFollowing)
                .build();

        UserScoreInfo scoreInfo = userScoreService.getUserScore(userId)
                .orElse(UserScoreInfo.builder().build());
        FollowStatsInfo followStats = userFollowService.getFollowStats(userId);
        BattleStatsInfo battleStats = battleHIstoryService.getBattleStats(userId);

        UserCombinedStatsDto combinedStats = UserCombinedStatsDto.builder()
                .profileInfo(profileInfo)
                .scoreInfo(scoreInfo)
                .followStats(followStats)
                .battleStats(battleStats)
                .build();

        return CommonResponseDto.ok(combinedStats);
    }
}
