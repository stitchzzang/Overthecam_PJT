package com.overthecam.websocket.controller;

import com.overthecam.websocket.dto.InvitationRequest;
import com.overthecam.websocket.dto.InvitationResponse;
import com.overthecam.websocket.dto.MessageType;
import com.overthecam.websocket.dto.UserPrincipal;
import com.overthecam.websocket.dto.WebSocketRequestDto;
import com.overthecam.websocket.dto.WebSocketResponseDto;
import com.overthecam.websocket.util.WebSocketRequestMapper;
import com.overthecam.websocket.util.WebSocketSecurityUtils;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class NotificationWebSocketController {

    private final WebSocketRequestMapper requestMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/battle/invite")
    public void inviteBattle(WebSocketRequestDto<?> request, SimpMessageHeaderAccessor headerAccessor) {
        UserPrincipal inviter = WebSocketSecurityUtils.getUser(headerAccessor);
        InvitationRequest invitationRequest = requestMapper.mapToInvitationRequest(request);

        InvitationResponse response = InvitationResponse.builder()
            .inviterId(inviter.getUserId())
            .inviterNickname(inviter.getNickname())
            .battleId(invitationRequest.getBattleId())
            .battleTitle(invitationRequest.getBattleTitle())
            .invitedAt(LocalDateTime.now())
            .build();

        // 초대한 사용자에게 메시지 전송
        messagingTemplate.convertAndSendToUser(
            String.valueOf(inviter.getUserId()),
            "/queue/notifications",
            WebSocketResponseDto.success(MessageType.SYSTEM_INVITE, response)
        );

        // 초대받은 사용자에게 메시지 전송
        messagingTemplate.convertAndSendToUser(
            String.valueOf(invitationRequest.getTargetId()),
            "/queue/notifications",
            WebSocketResponseDto.success(MessageType.SYSTEM_INVITE, response)
        );
    }
}
