package com.overthecam.battle.controller;

import com.overthecam.battle.dto.BattleCreateRequest;
import com.overthecam.battle.dto.BattleResponse;
import com.overthecam.battle.service.BattleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 1. 방제 입력후 create 버튼 누를 때 배틀방 생성 (방제랑 사용자 access-token을 받음)
 * 2. 배틀 시작하기를 누를 때 post 요청 (userId. 토큰 값. battle 테이블에서 status waiting -> progress
 * battle_participant도 배틀러 선정된거에 맞게 변경)
 */

@RestController
@RequestMapping("/api/battle")
@RequiredArgsConstructor
public class BattleController {

    private final BattleService battleService;


    @PostMapping("/room/create")
    public ResponseEntity<BattleResponse> createBattleRoom(@RequestBody BattleCreateRequest request,
                                                           @RequestHeader("Authorization") String authToken) {

        BattleResponse response = battleService.createBattleRoom(request, authToken);
        return ResponseEntity.ok(response);

    }


}
