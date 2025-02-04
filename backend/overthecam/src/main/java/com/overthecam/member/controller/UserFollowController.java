package com.overthecam.member.controller;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.member.service.UserFollowService;
import com.overthecam.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class UserFollowController {

    private final UserFollowService userFollowService;
    private final SecurityUtils securityUtils;

    @PostMapping("/follow/{targetId}")
    public CommonResponseDto<?> follow(Authentication authentication, @PathVariable Long targetId){
        Long userId = securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.success(userFollowService.follow(userId, targetId));
    }

    @DeleteMapping("/follow/{targetId}")
    public CommonResponseDto<?> unfollow(Authentication authentication, @PathVariable Long targetId){
        Long userId = securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.success(userFollowService.unfollow(userId, targetId));
    }

    @GetMapping("/my-following")
    public CommonResponseDto<?> getMyFollowingList(Authentication authentication){
        Long userId = securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.success(userFollowService.getMyFollowingList(userId));
    }

    @GetMapping("/my-follower")
    public CommonResponseDto<?> getMyFollowerList(Authentication authentication){
        Long userId = securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.success(userFollowService.getMyFollowerList(userId));
    }


    @GetMapping("/other-following/{userId}")
    public CommonResponseDto<?> getOthersFollowingList(@PathVariable Long userId){
        return CommonResponseDto.success(userFollowService.getMyFollowingList(userId));
    }

    @GetMapping("/other-follower/{userId}")
    public CommonResponseDto<?> getOthersFollowerList(@PathVariable Long userId){
        return CommonResponseDto.success(userFollowService.getMyFollowerList(userId));
    }

}
