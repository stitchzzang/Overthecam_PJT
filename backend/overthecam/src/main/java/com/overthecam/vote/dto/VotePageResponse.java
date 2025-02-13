package com.overthecam.vote.dto;

import com.overthecam.common.dto.PageInfo;
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

    public static VotePageResponse of(Page<VoteDetailResponse> page) {
        return VotePageResponse.builder()
                .content(page.getContent())
                .pageInfo(PageInfo.of(page))
                .build();
    }
}