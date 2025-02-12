package com.overthecam.member.repository;

import com.overthecam.common.dto.PageInfo;
import com.overthecam.member.domain.BattleHistoryView;
import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Builder
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class BattleHistoryPageResponse {
    private List<BattleHistoryView> content;
    private PageInfo pageInfo;

    public static BattleHistoryPageResponse of(Page<BattleHistoryView> page) {
        return BattleHistoryPageResponse.builder()
                .content(page.getContent())
                .pageInfo(PageInfo.of(page))
                .build();
    }
}