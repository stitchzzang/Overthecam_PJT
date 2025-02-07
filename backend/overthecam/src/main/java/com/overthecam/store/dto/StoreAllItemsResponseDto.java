package com.overthecam.store.dto;

import com.overthecam.store.domain.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreAllItemsResponseDto {

    private Long storeItemId;
    private String imageUrl;
    private String name;
    private int price;
    private String detail;
    private ItemType type;

}
