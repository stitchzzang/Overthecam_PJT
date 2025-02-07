package com.overthecam.websocket.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InvitationRequest {
    private Long invitedUserId;  // 초대받는 사용자 ID
    private Long battleId;       // 초대하는 배틀 ID
    private String battleTitle;
}
