package com.overthecam.battle.dto;

//참가자 1명1명의 정보
public class ParticipantSessionInfo {
    private Long userId;
    private int role; //1:방장, 2:참가자, 5:방장+배틀러, 6:참가자+배틀러)
    private String sessionId;
    private String connectionToken;
}
