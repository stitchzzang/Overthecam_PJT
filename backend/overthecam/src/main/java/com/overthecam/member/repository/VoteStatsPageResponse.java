package com.overthecam.member.repository;

import com.overthecam.member.dto.VoteStatsInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteStatsPageResponse {
    private List<VoteStatsInfo> content;
    private PageInfo pageInfo;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageInfo {
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private int pageSize;
    }

    public static VoteStatsPageResponse of(Page<VoteStatsInfo> page) {
        return VoteStatsPageResponse.builder()
                .content(page.getContent())
                .pageInfo(PageInfo.builder()
                        .currentPage(page.getNumber())
                        .totalPages(page.getTotalPages())
                        .totalElements(page.getTotalElements())
                        .pageSize(page.getSize())
                        .build())
                .build();
    }
}
