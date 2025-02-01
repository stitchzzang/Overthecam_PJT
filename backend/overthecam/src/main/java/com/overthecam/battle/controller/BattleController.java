package com.overthecam.battle.controller;

import com.overthecam.battle.dto.BattleCreateRequest;
import com.overthecam.battle.dto.BattleResponse;
import com.overthecam.battle.service.BattleService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 1. 방제 입력후 create 버튼 누를 때 배틀방 생성 (방제랑 사용자 access-token을 받음)
 * 2. 배틀러 선정 후 배틀 시작하기를 누르면 배틍방 시작(status waiting -> progress)
 */

@RestController
@RequestMapping("/api/battle")
@RequiredArgsConstructor
public class BattleController {

    private final BattleService battleService;


    @PostMapping("/room/create")
    public ResponseEntity<BattleResponse> createBattleRoom(@RequestBody BattleCreateRequest request,
                                                           @RequestHeader("Authorization") String authToken) throws OpenViduJavaClientException, OpenViduHttpException {
        BattleResponse response = battleService.createBattleRoom(request, authToken);
        return ResponseEntity.ok(response);

    }


}
