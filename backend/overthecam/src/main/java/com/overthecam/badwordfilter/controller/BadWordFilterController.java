package com.overthecam.badwordfilter.controller;

import com.overthecam.badwordfilter.dto.BadWordRequest;
import com.overthecam.badwordfilter.dto.FilterResponse;
import com.overthecam.badwordfilter.dto.FilterResult;
import com.overthecam.badwordfilter.service.BadWordTrieService;
import com.overthecam.badwordfilter.service.FilterService;
import com.overthecam.common.dto.CommonResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/filter")
@RestController
@RequiredArgsConstructor
public class BadWordFilterController {

    private final FilterService filterService;
    private final BadWordTrieService badWordTrieService;

    @PostMapping("/badword")
    public CommonResponseDto<FilterResponse> filtering(@RequestBody BadWordRequest request) {
        // Trie가 없으면 먼저 구축
        if (badWordTrieService.getTrie() == null) {
            badWordTrieService.buildTrie();
        }

        // 필터링 수행
        FilterResult filterResult = filterService.filter(
            request.getText(),
            badWordTrieService.getTrie()
        );

        // 원본 텍스트 복원
        String originalText = filterService.reconstruct(
            filterResult,
            filterResult.getFilteredText()
        );

        return CommonResponseDto.ok(
            FilterResponse.builder()
                .containsBadWord(filterResult.isContainsBanword())
                .filteredText(filterResult.getFilteredText())
                .originalText(originalText)
                .build()
        );
    }


}
