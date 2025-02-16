package com.overthecam.badwordfilter.dto;

import com.overthecam.badwordfilter.FilterType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 필터링된 개별 문자의 정보를 저장하는 클래스
 */
@Getter
@Builder
@AllArgsConstructor
public class FilteredChar {
    private final char character;   // 필터링된 문자
    private final int position;     // 원본 텍스트에서의 위치
    private final FilterType type;  // 필터링 유형

}
