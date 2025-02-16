package com.overthecam.websocket.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BattleRoomStatus {
    private List<BattleReadyUser> readyUsers;
    private VoteInfo voteInfo;
}
