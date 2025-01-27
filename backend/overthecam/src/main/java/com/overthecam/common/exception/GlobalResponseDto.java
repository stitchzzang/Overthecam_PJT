package com.overthecam.common.exception;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class GlobalResponseDto<T> {
    private String code;
    private String message;
    private T data;
}
