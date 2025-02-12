package com.overthecam.member.repository;

import com.overthecam.common.dto.PageInfo;
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

    public static VoteStatsPageResponse of(Page<VoteStatsInfo> page) {
        return VoteStatsPageResponse.builder()
                .content(page.getContent())
                .pageInfo(PageInfo.of(page))
                .build();
    }
}