package com.overthecam.badwordfilter;

import lombok.Getter;

/**
 * 필터링할 패턴 정책을 정의하는 열거형
 */
public enum FilterPolicy {
    WHITESPACE("[\\s]", FilterType.WHITESPACE),           // 공백 문자
    SPECIAL_CHARS("[^\\p{L}\\p{N}\\s]", FilterType.SPECIAL), // 특수문자
    NUMBERS("[\\p{N}]", FilterType.NUMBER),              // 숫자
    CONSONANTS("[ㄱ-ㅎ]", FilterType.CONSONANT),         // 자음
    VOWELS("[ㅏ-ㅣ]", FilterType.VOWEL),                // 모음
    REPEATING("(.)\\1+", FilterType.REPEAT);            // 반복되는 문자

    public final String regex;
    public final FilterType type;

    FilterPolicy(String regex, FilterType type) {
        this.regex = regex;
        this.type = type;
    }



}

