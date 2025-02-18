package com.overthecam.member.controller;

import com.overthecam.auth.domain.User;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.member.dto.*;
import com.overthecam.member.repository.VoteStatsPageResponse;
import com.overthecam.member.service.*;
import com.overthecam.security.util.SecurityUtils;
import com.overthecam.vote.dto.VoteDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final SecurityUtils securityUtils;
    private final MyPageService myPageService;
    private final BattleHIstoryService battleHIstoryService;
    private final UserScoreService userScoreService;
    private final UserFollowService userFollowService;
    private final VoteHistoryService voteHistoryService;


    @PostMapping("/revert")
    public CommonResponseDto<UserScoreInfo> revertScoreToPoint(Authentication authentication, @RequestParam("supportScore") int supportScore) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.ok(myPageService.revertScoreToPoint(userId, supportScore));
    }

    @GetMapping("/battle/history")
    public CommonResponseDto<?> battleHistory(
            Authentication authentication,
            @RequestParam(value = "userId", required = false) Long targetUserId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = targetUserId != null ?
                targetUserId :
                securityUtils.getCurrentUserId(authentication);

        return CommonResponseDto.ok(battleHIstoryService.findBattleHistoryViewByUserId(userId, pageable));
    }

    @GetMapping("/vote/history")
    public CommonResponseDto<VoteStatsPageResponse> getMyVotes(
            Authentication authentication,
            @RequestParam(value = "userId", required = false) Long targetUserId,
            @RequestParam(value = "createdByMe", defaultValue = "false") boolean createdByMe,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = targetUserId != null ?
                targetUserId :
                securityUtils.getCurrentUserId(authentication);

        VoteStatsPageResponse response = voteHistoryService.getMyVotes(userId, createdByMe, pageable);
        return CommonResponseDto.ok(response);
    }

    @GetMapping("/vote/{voteId}/detail")
    public CommonResponseDto<VoteDetailResponse> getVoteDetail(
            Authentication authentication,
            @PathVariable Long voteId,
            @RequestParam(value = "userId", required = false) Long targetUserId
    ) {
        Long userId = targetUserId != null ?
                targetUserId :
                securityUtils.getCurrentUserId(authentication);

        VoteDetailResponse response = voteHistoryService.getVoteDetail(voteId, userId);
        return CommonResponseDto.ok(response);
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

    @GetMapping("/battle/{battleId}/detail")
    public CommonResponseDto<BattleCombinedStatusDto> getBattleDetailStatus(
            Authentication authentication,
            @PathVariable(name = "battleId") Long battleId,
            @RequestParam(value = "userId", required = false) Long targetUserId) {

        Long userId = targetUserId != null ?
                targetUserId :
                securityUtils.getCurrentUserId(authentication);

        BattleCombinedStatusDto response = battleHIstoryService.getBattleDetail(battleId, userId);
        return CommonResponseDto.ok(response);

    }


    @GetMapping("/profile")
    public CommonResponseDto<UserUpdateResponseDto> getMyProfile(
            Authentication authentication,
            @RequestParam(value = "userId", required = false) Long targetUserId) {
        Long userId = targetUserId != null ?
                targetUserId :
                securityUtils.getCurrentUserId(authentication);
        return CommonResponseDto.ok(myPageService.getUserProfile(userId));
    }
//
//    @PutMapping("/profile")
//    public CommonResponseDto<UserUpdateResponseDto> updateMyProfile(
//            Authentication authentication,
//            @RequestBody UserUpdateRequestDto request) {
//        Long userId = securityUtils.getCurrentUserId(authentication);
//        return CommonResponseDto.ok(myPageService.updateUserProfile(userId, request));
//    }
}
