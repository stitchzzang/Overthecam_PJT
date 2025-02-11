package com.overthecam.battle.dto;

import com.overthecam.battle.domain.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SelectBattlerResponse { //배틀러 선정시 넘겨주는 값들
    private String nickName;
    private ParticipantRole participantRole;
}
