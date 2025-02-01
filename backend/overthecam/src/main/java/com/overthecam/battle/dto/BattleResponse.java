package com.overthecam.battle.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BattleResponse {
    private Long battleId; //배틀방 번호
    private String title; //배틀방 제목
    private String sessionId; //세션 아이디
    private String connectionToken; //사용자별 토쿤
    private Long hostId; //사용자 닉네임
}
