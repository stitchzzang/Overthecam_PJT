package com.overthecam.battle.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/battles")
@RequiredArgsConstructor
public class BattleController {

    private final BattleService battleService;
    private final String OPENVIDU_URL = "${openvidu.url}";
    private final String SECRET = "${openvidu.secret}";

}
