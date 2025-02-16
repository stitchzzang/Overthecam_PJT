package com.overthecam.badwordfilter;

/**
 * 필터링된 문자의 유형을 나타내는 열거형
 */
public enum FilterType {
    WHITESPACE,  // 공백
    SPECIAL,     // 특수문자
    NUMBER,      // 숫자
    CONSONANT,   // 자음
    VOWEL,       // 모음
    REPEAT       // 반복문자
}
