package com.overthecam.badwordfilter;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BadWordErrorCode implements ErrorCode {

    DUPLICATED_BAD_WORD(409, "이미 존재하는 비속어입니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }

}