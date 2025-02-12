package com.overthecam.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageInfo {
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;

    public static PageInfo of(Page<?> page) {
        return PageInfo.builder()
                .currentPage(page.getNumber() + 1)  // 0-based를 1-based로 변환
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .build();
    }
}
