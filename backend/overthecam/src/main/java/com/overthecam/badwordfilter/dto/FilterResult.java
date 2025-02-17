package com.overthecam.badwordfilter.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 필터링 결과를 저장하는 클래스
 */
@Getter
@Builder
@AllArgsConstructor
public class FilterResult {
    private final boolean containsBanword;
    private final String filteredText;          // 필터링된 텍스트
    private final List<FilteredChar> filteredChars;  // 필터링된 문자 정보 리스트

}
