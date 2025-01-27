package com.overthecam.store.service;

import com.overthecam.store.dto.StoreItemResponseDto;
import com.overthecam.store.repository.StoreItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreItemService {

    private final StoreItemRepository storeItemRepository;

    public List<StoreItemResponseDto> getAllItems() {
        return storeItemRepository.findByTypeLessThan(3).stream()
                .map(item -> StoreItemResponseDto.builder()
                        .name(item.getName())
                        .price(item.getPrice())
                        .detail(item.getDetail())
                        .imageUrl(item.getImageUrl())
                        .type(item.getType())
                        .build())
                .collect(Collectors.toList());
    }
}
