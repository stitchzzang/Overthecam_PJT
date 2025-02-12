package com.overthecam.member.controller;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.member.dto.FollowResponse;
import com.overthecam.member.dto.UserProfileInfo;
import com.overthecam.member.service.UserFollowService;
import com.overthecam.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class UserFollowController {

    private final UserFollowService userFollowService;
    private final SecurityUtils securityUtils;

    @PostMapping("/follow/{targetId}")
    public CommonResponseDto<FollowResponse> follow(Authentication authentication, @PathVariable Long targetId) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.ok(userFollowService.follow(userId, targetId));
    }

    @DeleteMapping("/follow/{targetId}")
    public CommonResponseDto<FollowResponse> unfollow(Authentication authentication, @PathVariable Long targetId) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.ok(userFollowService.unfollow(userId, targetId));
    }

    @GetMapping("/following")
    public CommonResponseDto<List<UserProfileInfo>> getFollowingList(
            Authentication authentication,
            @RequestParam(required = false) Long userId
    ) {
        Long currentUserId = securityUtils.getCurrentUserId(authentication);
        Long targetUserId = userId != null ? userId : currentUserId;

        return CommonResponseDto.ok(userFollowService.getFollowingList(targetUserId, currentUserId));
    }

    @GetMapping("/followers")
    public CommonResponseDto<List<UserProfileInfo>> getFollowerList(
            Authentication authentication,
            @RequestParam(required = false) Long userId
    ) {
        Long currentUserId = securityUtils.getCurrentUserId(authentication);
        Long targetUserId = userId != null ? userId : currentUserId;

        return CommonResponseDto.ok(userFollowService.getFollowerList(targetUserId, currentUserId));
    }

}
