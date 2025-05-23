package com.overthecam.websocket.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BattleRoomStatus {
    private List<BattleReadyUser> readyUsers;
    private VoteInfo voteInfo;
}
