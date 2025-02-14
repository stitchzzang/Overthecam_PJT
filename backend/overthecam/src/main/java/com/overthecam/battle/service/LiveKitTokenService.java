package com.overthecam.battle.service;

import com.overthecam.auth.domain.User;
import com.overthecam.battle.domain.ParticipantRole;
import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.WebhookReceiver;
import livekit.LivekitWebhook;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * LiveKit 토큰 생성을 담당하는 서비스
 */
@Service
@RequiredArgsConstructor
public class LiveKitTokenService {
    @Value("${livekit.api.key}")
    private String livekitApiKey;
    @Value("${livekit.api.secret}")
    private String livekitApiSecret;

    /**
     * 사용자 역할에 맞는 LiveKit 토큰을 생성합니다.
     * @param user 사용자 정보
     * @param participantName 참가자 이름
     * @param roomName 방 이름
     * @param role 참가자 역할
     * @return 생성된 JWT 토큰
     */
    public String createToken(User user, String participantName, String roomName, ParticipantRole role) {
        AccessToken token = new AccessToken(livekitApiKey, livekitApiSecret);
        token.setName(participantName);
        token.setIdentity(participantName);

        // 역할에 따른 메타데이터 설정
        if (ParticipantRole.isHost(role)) {
            token.setMetadata(createMetadata(user, "host"));
        } else {
            token.setMetadata(createMetadata(user, "participant"));
        }

        token.addGrants(new RoomJoin(true), new RoomName(roomName));
        return token.toJwt();
    }

    /**
     * LiveKit 메타데이터를 생성합니다.
     * @param user 사용자 정보
     * @param role 사용자 역할
     * @return JSON 형태의 메타데이터 문자열
     */
    private String createMetadata(User user, String role) {
        JSONObject metadata = new JSONObject();
        metadata.put("userId", user.getId());
        metadata.put("nickname", user.getNickname());
        metadata.put("profileImage", user.getProfileImage());
        metadata.put("role", role);
        return metadata.toString();
    }

    /**
     * LiveKit 웹훅 이벤트 처리
     */
    public LivekitWebhook.WebhookEvent handleWebhookEvent(String authHeader, String body) throws Exception {
        WebhookReceiver webhookReceiver = new WebhookReceiver(livekitApiKey, livekitApiSecret);
        return webhookReceiver.receive(body, authHeader);
    }
}
