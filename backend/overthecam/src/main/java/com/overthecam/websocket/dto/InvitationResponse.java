package com.overthecam.websocket.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InvitationResponse {
    private Long inviterId;         // 초대한 사용자 ID
    private String inviterNickname; // 초대한 사용자 닉네임
    private Long battleId;          // 배틀 ID
    private String battleTitle;     // 배틀 제목
    private LocalDateTime invitedAt;// 초대 시간
}
