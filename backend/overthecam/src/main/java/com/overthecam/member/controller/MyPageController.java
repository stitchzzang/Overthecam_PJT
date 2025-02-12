package com.overthecam.member.controller;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.member.service.BattleHIstoryService;
import com.overthecam.member.service.MyPageService;
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

}
