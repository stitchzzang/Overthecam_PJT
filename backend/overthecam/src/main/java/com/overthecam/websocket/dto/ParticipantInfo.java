package com.overthecam.websocket.dto;

import com.overthecam.battle.domain.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ParticipantInfo {
    private Long userId;
    private String nickname;
    private String profileImage;
    private ParticipantRole role;
    private String connectionToken;

}
