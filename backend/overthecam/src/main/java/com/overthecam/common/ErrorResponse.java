package com.overthecam.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse<T> {

    private boolean success;
    private int statusCode;
    private String message;
    private T data;

}
