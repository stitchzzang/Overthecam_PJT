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
        log.debug("사용자로부터 초대 요청이 왔습니다.: {}", inviter.getEmail());

        InvitationRequest invitationRequest = requestMapper.mapToInvitationRequest(request.getData());
        log.debug("초대 대상 사용자: {}", invitationRequest.getInvitedUserId());

        InvitationResponse response = InvitationResponse.builder()
                .inviterId(inviter.getUserId())
                .inviterNickname(inviter.getNickname())
                .battleId(invitationRequest.getBattleId())
                .battleTitle(invitationRequest.getBattleTitle())
                .invitedAt(LocalDateTime.now())
                .build();
        log.debug("초대 응답이 만들어짐: {}", response);

        String targetUserStr = String.valueOf(invitationRequest.getInvitedUserId());
        log.debug("Sending notification to user: {} with destination: /queue/notifications", targetUserStr);

        try {
            messagingTemplate.convertAndSendToUser(
                    targetUserStr,
                    "/queue/notifications",
                    WebSocketResponseDto.success(MessageType.SYSTEM_INVITE, response)
            );
            log.debug("Message successfully sent to messagingTemplate");
        } catch (Exception e) {
            log.error("Error sending message:", e);
        }
    }
}
