package com.overthecam.search.exception;


import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SearchErrorCode implements ErrorCode {
    EMPTY_KEYWORD(400, "검색어를 입력해주세요"),
    INVALID_KEYWORD(400, "검색어가 유효하지 않습니다"),
    SEARCH_FAILED(500, "검색 중 오류가 발생했습니다");


    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }

}
