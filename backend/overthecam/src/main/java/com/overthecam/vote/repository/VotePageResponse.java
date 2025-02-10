package com.overthecam.vote.repository;

import com.overthecam.vote.dto.VoteDetailResponse;
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
public class VotePageResponse {
    private List<VoteDetailResponse> content;
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

    public static VotePageResponse of(Page<VoteDetailResponse> page) {
        return VotePageResponse.builder()
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
