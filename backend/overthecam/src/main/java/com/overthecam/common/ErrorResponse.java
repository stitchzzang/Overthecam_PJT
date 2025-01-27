package com.overthecam.common;

import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ErrorResponse {

    private boolean success;
    private final int statusCode;
    private final String code;
    private final String message;

}
