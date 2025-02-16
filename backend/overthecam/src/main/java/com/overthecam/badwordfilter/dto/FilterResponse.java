package com.overthecam.badwordfilter.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FilterResponse {
    private boolean containsBadWord;
    private String originalText;
    private String filteredText;

}