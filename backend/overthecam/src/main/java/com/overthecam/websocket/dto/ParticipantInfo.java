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
    private ParticipantRole role; //1:방장, 2:참가자, 5:방장+배틀러, 6:참가자+배틀러)

}
