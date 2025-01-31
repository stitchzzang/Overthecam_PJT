package com.overthecam.battle.controller;

import com.overthecam.common.dto.CommonResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 초기에 방을 생성할때 -> 사용자가 우리 회원일 경우 -> secret-key로 openvidu에게 방 생성요청
 * openvidu에게 session_id 받은 후 우리 db에 저장 (battle_id에 대한 session_id가 1:1)
 * 사용자 token을 만들어서 front에게 token, session_id..? 전송
 * 방장이든 아니든 발급된 token과 sessionId로 방 접속 허락
 */

@RestController
@RequestMapping("/api/battles")
@RequiredArgsConstructor
public class BattleController {

    @PostMapping // 맨 처음 한 번 방장이 방을 만들 때 secret-key 로 openvidu에게 방 생성 요청을 보내는 컨트롤러
    public ResponseEntity<?> createBattle(@AuthenticationPrincipal UserDetails userDetails) {
        String sessionId = battleService.createBattleSession(Long.parseLong(userDetails.getUsername()));
        return ResponseEntity.ok(CommonResponseDto.success("sessionId", sessionId));
    }


}
