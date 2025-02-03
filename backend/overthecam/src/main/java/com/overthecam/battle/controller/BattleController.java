package com.overthecam.battle.controller;

import com.overthecam.battle.dto.BattleCreateRequest;
import com.overthecam.battle.dto.BattleResponse;
import com.overthecam.battle.dto.BattleStartResponse;
import com.overthecam.battle.dto.RandomVoteTopicResponse;
import com.overthecam.battle.service.BattleService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.exception.ErrorCode;
import com.overthecam.security.jwt.JwtTokenProvider;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/battle")
@RequiredArgsConstructor
public class BattleController {

    private final BattleService battleService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 배틀방 생성 API
     */
    @PostMapping("/room")
    public CommonResponseDto<BattleResponse> createBattleRoom(
            @RequestHeader("Authorization") String token,
            @RequestBody BattleCreateRequest request) {
        try {
            // 1. 토큰에서 사용자 ID 추출
            String bearerToken = token.substring(7);  // "Bearer " 제거
            Long userId = jwtTokenProvider.getUserId(bearerToken);

            BattleResponse response = battleService.createBattleRoom(request, userId);
            return CommonResponseDto.success("배틀방이 성공적으로 생성되었습니다.", response);
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            return CommonResponseDto.error(ErrorCode.OPENVIDU_ERROR);
        }
    }

    /**
     * 배틀방 참가 API
     */
    @PostMapping("room/{battleId}/join")
    public CommonResponseDto<BattleResponse> joinBattle(
            @PathVariable Long battleId) {
        try {
            BattleResponse response = battleService.joinBattle(battleId);
            return CommonResponseDto.success("배틀방 참가에 성공했습니다.", response);
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            return CommonResponseDto.error(ErrorCode.OPENVIDU_ERROR);
        } catch (RuntimeException e) {
            return CommonResponseDto.error(ErrorCode.BATTLE_NOT_FOUND);
        }
    }

    /**
     * 배틀러 선정 및 배틀 시작 API
     */
    //파라미터: 배틀방 id, battle_participant의 userId 리스트(프론트엔드가 배틀러로 선택한 두 명의 user_id를 받는다.)
    @PostMapping("/room/{battleId}/start")
    public CommonResponseDto<BattleStartResponse> startBattle(
            @PathVariable Long battleId,
            @RequestBody List<Long> selectedBattlerIds) {
        try {
            BattleStartResponse response = battleService.selectBattlersAndStart(battleId, selectedBattlerIds);
            return CommonResponseDto.success("배틀이 성공적으로 시작되었습니다.", response);
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            return CommonResponseDto.error(ErrorCode.OPENVIDU_ERROR);
        } catch (RuntimeException e) {
            return CommonResponseDto.error(ErrorCode.BATTLE_NOT_FOUND);
        }
    }


    /**
     * 랜덤 주제 생성 API
     */
    @GetMapping("/random")
    public CommonResponseDto<RandomVoteTopicResponse> createRandomVoteTopic() {
        RandomVoteTopicResponse response = battleService.createRandomVoteTopic();
        return CommonResponseDto.success("랜덤 주제가 생성되었습니다.", response);
    }

    /**
     * 방제목 변경 API
     */
    @PutMapping("room/{battleId}/title")
    public CommonResponseDto<BattleResponse> updateTitle(
            @PathVariable Long battleId,
            @RequestBody String newTitle,
            @RequestHeader("Authorization") String authToken) {
        try {
            // userId는 나중에 토큰에서 추출
            BattleResponse response = battleService.updateTitle(battleId, newTitle);
            return CommonResponseDto.success("방제가 성공적으로 변경되었습니다.", response);
        } catch (RuntimeException e) {
            return CommonResponseDto.error(ErrorCode.BATTLE_TITLE_UPDATE_FAILED);
        }
    }


}
