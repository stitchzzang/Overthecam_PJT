package com.overthecam.badwordfilter.controller;

import com.overthecam.badwordfilter.BadWordErrorCode;
import com.overthecam.badwordfilter.domain.BadWord;
import com.overthecam.badwordfilter.dto.BadWordRequest;
import com.overthecam.badwordfilter.dto.FilterResponse;
import com.overthecam.badwordfilter.dto.FilterResult;
import com.overthecam.badwordfilter.repository.BadWordRepository;
import com.overthecam.badwordfilter.service.BadWordTrieService;
import com.overthecam.badwordfilter.service.FilterService;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.exception.GlobalException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/bad-word")
@RestController
@RequiredArgsConstructor
public class BadWordFilterController {

    private final FilterService filterService;
    private final BadWordTrieService badWordTrieService;
    private final BadWordRepository badWordRepository;

    @PostMapping("/filter")
    public CommonResponseDto<FilterResponse> filtering(@RequestBody BadWordRequest request) {

        // 필터링 수행
        FilterResult filterResult = filterService.filter(
            request.getText(),
            badWordTrieService.getTrie()
        );


        return CommonResponseDto.ok(
            FilterResponse.builder()
                .containsBadWord(filterResult.isContainsBanword())
                .originalText(request.getText())
                .filteredText(filterResult.getFilteredText())
                .build()
        );
    }

    @PostMapping("/add")
    public CommonResponseDto<?> addBadWord(@RequestBody BadWordRequest request) {
        // 이미 존재하는지 확인
        if (badWordRepository.existsByWord(request.getText())) {
            throw new GlobalException(BadWordErrorCode.DUPLICATED_BAD_WORD, "이미 데이터베이스에 저장된 비속어입니다.");
        }

        // 새로운 비속어 저장
        BadWord badWord = BadWord.builder()
            .word(request.getText())
            .build();

        badWordRepository.save(badWord);

        // Trie 갱신
        //badWordTrieService.refreshTrie();

        return CommonResponseDto.ok();
    }


}
