package com.overthecam.member.repository;

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
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;

    public static BattleHistoryPageResponse of(Page<BattleHistoryView> page) {
        return BattleHistoryPageResponse.builder()
                .content(page.getContent())
                .pageNumber(page.getNumber() + 1)  // 0-based를 1-based로 변환
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}