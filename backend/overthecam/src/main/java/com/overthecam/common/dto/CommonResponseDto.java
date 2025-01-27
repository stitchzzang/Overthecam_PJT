package com.overthecam.common.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class CommonResponseDto<T> {
    private String code;
    private String message;
    private T data;
}
