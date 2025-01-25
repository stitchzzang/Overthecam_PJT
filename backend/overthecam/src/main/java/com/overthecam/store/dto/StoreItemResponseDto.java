package com.overthecam.store.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class StoreItemResponseDto {
    private String name;
    private int price;
    private String detail;
    private String imageUrl;
    private int type;
}
