package com.overthecam.member.controller;

import com.overthecam.auth.domain.User;
import com.overthecam.battlereport.domain.BattleReport;
import com.overthecam.battlereport.exception.BattleReportErrorCode;
import com.overthecam.battlereport.repository.BattleReportRepository;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.member.dto.*;
import com.overthecam.member.repository.VoteStatsPageResponse;
import com.overthecam.member.service.*;
import com.overthecam.security.util.SecurityUtils;
import com.overthecam.vote.dto.VoteDetailResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    private final BattleReportRepository battleReportRepository;


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
            @PageableDefault(size = 10, sort = "created_at", direction = Sort.Direction.DESC) Pageable pageable
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


    @PostMapping("/profile")
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
// 사용자의 모든 리포트 목록 조회
    // 내 리포트 목록 조회
    @GetMapping("/reports")
    public CommonResponseDto<Map<String, List<BattleReportDTO>>> getMyReports(
            Authentication authentication
    ) {
        Integer userId = securityUtils.getCurrentUserId(authentication).intValue();
        List<BattleReport> reports = battleReportRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<BattleReportDTO> reportDTOs = reports.stream()
                .map(report -> BattleReportDTO.builder()
                        .id(report.getId())
                        .title(report.getTitle())
                        .build())
                .collect(Collectors.toList());

        Map<String, List<BattleReportDTO>> response = new HashMap<>();
        response.put("report", reportDTOs);

        return CommonResponseDto.ok(response);
    }

    // 내 리포트 상세 조회
    @GetMapping("/reports/{reportId}")
    public CommonResponseDto<BattleReportDetailDTO> getReportDetail(
            Authentication authentication,
            @PathVariable Long reportId
    ) {
        Integer userId = securityUtils.getCurrentUserId(authentication).intValue();

        BattleReport report = battleReportRepository.findByIdAndUserId(reportId, userId)
                .orElseThrow(() -> new EntityNotFoundException("리포트를 찾을 수 없습니다."));

        return CommonResponseDto.ok(BattleReportDetailDTO.from(report));
    }
}