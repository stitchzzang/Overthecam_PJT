package com.overthecam.battle.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BattleStartResponse { //배틀러 선정이 완료되고 배틀이 시작될 때, 프론트엔드에 전달할 응답 데이터
    private Long battleId;
    private String sessionId;
    private List<ParticipantSessionInfo> participants;
}
