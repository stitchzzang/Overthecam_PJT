package com.overthecam.battle.controller;

import com.overthecam.battle.dto.BattleCreateRequest;
import com.overthecam.battle.dto.BattleResponse;
import com.overthecam.battle.dto.RandomVoteTopicResponse;
import com.overthecam.battle.dto.SelectBattlerResponse;
import com.overthecam.battle.service.BattleService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.exception.ErrorCode;
import com.overthecam.security.jwt.JwtTokenProvider;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
    @PostMapping("/room/{battleId}/join")
    public CommonResponseDto<BattleResponse> joinBattle(
            @PathVariable("battleId") Long battleId, @RequestHeader("Authorization") String token) {
        try {

            String bearerToken = token.substring(7);  // "Bearer " 제거
            Long userId = jwtTokenProvider.getUserId(bearerToken);

            BattleResponse response = battleService.joinBattle(battleId, userId);
            return CommonResponseDto.success("배틀방 참가에 성공했습니다.", response);
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            return CommonResponseDto.error(ErrorCode.OPENVIDU_ERROR);
        } catch (RuntimeException e) {
            return CommonResponseDto.error(ErrorCode.BATTLE_NOT_FOUND);
        }
    }

    /**
     * 배틀러 선정 API
     */
    //파라미터: 배틀방 id, battle_participant의 userId 리스트(프론트엔드가 배틀러로 선택한 두 명의 user_id를 받는다.)
    @GetMapping("/room/{battleId}/start/{battler1}/{battler2}")
    public CommonResponseDto<SelectBattlerResponse> startBattle(
            @PathVariable("battleId") Long battleId,
            @PathVariable("battler1") String battler1,
            @PathVariable("battler2") String battler2) {
        try {
            SelectBattlerResponse response = battleService.selectBattlers(battleId, battler1, battler2);
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
            @PathVariable("battleId") Long battleId,
            @RequestBody String newTitle) {
        try {
            BattleResponse response = battleService.updateTitle(battleId, newTitle);
            return CommonResponseDto.success("방제가 성공적으로 변경되었습니다.", response);
        } catch (RuntimeException e) {
            return CommonResponseDto.error(ErrorCode.BATTLE_TITLE_UPDATE_FAILED);
        }
    }


}
