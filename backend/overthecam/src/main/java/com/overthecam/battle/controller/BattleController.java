package com.overthecam.battle.controller;

import com.overthecam.battle.service.BattleService;
import com.overthecam.common.dto.CommonResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 1. 방제 입력후 create 버튼 누를 때 배틀 방은 이미 만들진 상태 (방제랑 사용자 access-token post)
 * 2. 대기 모드방에서 배틀러가 다 차고 방장이 배틀러 선정한 한 후에 선정 완료 버튼을 누른 후 배틀 시작하기를 누르면 백엔드한테 post 요청
 * (userId. battle 테이블에서 status waiting -> progress로 . battle_participant도 배틀러 선정된거에 맞게 변경)
 * 초기에 방을 생성할때 -> 사용자가 우리 회원일 경우 -> secret-key로 openvidu에게 방 생성요청
 * openvidu에게 session_id 받은 후 우리 db에 저장 (battle_id에 대한 session_id가 1:1)
 * 사용자 token을 만들어서 front에게 token, session_id..? 전송
 * 방장이든 아니든 발급된 token과 sessionId로 방 접속 허락
 */

@RestController
@RequestMapping("/api/battle")
@RequiredArgsConstructor
public class BattleController {

    private final BattleService battleService;

    @PostMapping // 1번 로직
    public ResponseEntity<?> createBattle(@AuthenticationPrincipal UserDetails userDetails) {
        String sessionId = battleService.createBattleSession(Long.parseLong(userDetails.getUsername()));
        return ResponseEntity.ok(CommonResponseDto.success("sessionId", sessionId));
    }

    @PostMapping("rooms/join")
    public ResponseEntity<CommonResponseDto<String>> joinBattle(
            @PathVariable Long battleId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String token = battleService.generateToken(battleId);
        return ResponseEntity.ok(CommonResponseDto.success("token", token));
    }


}
