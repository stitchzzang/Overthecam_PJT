package com.overthecam.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ParticipantInfo {
    private Long userId;
    private String nickname;
    private String profileImage;
    private int role; //1:방장, 2:참가자, 5:방장+배틀러, 6:참가자+배틀러)
    private String connectionToken;
    private Integer supportScore;
    private Integer point;

}
