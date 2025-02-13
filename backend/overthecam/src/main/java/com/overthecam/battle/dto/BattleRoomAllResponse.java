package com.overthecam.battle.dto;

import com.overthecam.battle.domain.Battle;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class BattleRoomAllResponse {
    private List<BattleInfo> battleInfo;

    private int totalPages;
    private int currentPage;
    private boolean hasNext;

    public static BattleRoomAllResponse of(Page<Battle> battlePage) {
        return BattleRoomAllResponse.builder()
                .battleInfo(battlePage.getContent().stream()
                        .map(BattleInfo::from)
                        .collect(Collectors.toList()))
                .totalPages(battlePage.getTotalPages())
                .currentPage(battlePage.getNumber())
                .hasNext(battlePage.hasNext())
                .build();
    }

}
