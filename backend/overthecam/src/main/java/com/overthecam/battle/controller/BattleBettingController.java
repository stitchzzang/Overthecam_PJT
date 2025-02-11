package com.overthecam.battle.controller;

import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.battle.dto.BattleBettingRequest;
import com.overthecam.battle.service.BattleBettingService;
import com.overthecam.battle.service.BattleResultService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.security.util.SecurityUtils;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/battle/betting")
public class BattleBettingController {

    private final BattleBettingService battleBettingService;
    private final BattleResultService battleResultService;
    private final SecurityUtils securityUtils;

    /*
    배틀러 전용 투표
     */
    @PostMapping("/{battleId}/battler")
    public CommonResponseDto<?> voteBattler(Authentication authentication,
                                            @PathVariable Long battleId,
                                            @RequestBody BattleBettingRequest request) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        battleBettingService.voteBattler(battleId, userId, request.getOptionId());
        return CommonResponseDto.ok();
    }

    /*
    일반 참여자 전용 투표
     */
    @PostMapping("/{battleId}/participant")
    public CommonResponseDto<?> voteParticipant(Authentication authentication,
                                                @PathVariable Long battleId,
                                                @RequestBody BattleBettingRequest request) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        UserScoreInfo userScoreInfo = battleBettingService.vote(battleId, userId, request.getOptionId(), request.getSupportScore());
        return CommonResponseDto.ok(userScoreInfo);
    }

    /**
     * 현재 투표 현황 조회
     */
    @GetMapping("/{battleId}/status")
    public CommonResponseDto<?> getVoteStatus(@PathVariable Long battleId) {
        Map<Long, List<BattleBettingInfo>> voteStatus = battleBettingService.getDetailedVoteStatus(battleId);
        return CommonResponseDto.ok(voteStatus);
    }

    /**
     * 배틀 투표 종료 및 결과 확정
     */
    @PostMapping("/{battleId}/finalize")
    public CommonResponseDto<?> finalizeBattleVotes(@PathVariable Long battleId) {
        return CommonResponseDto.ok(battleResultService.finalizeBattleVotes(battleId));
    }
}
