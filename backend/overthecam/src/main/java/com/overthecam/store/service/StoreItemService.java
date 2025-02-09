package com.overthecam.store.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.store.exception.StoreErrorCode;
import com.overthecam.store.domain.ItemType;
import com.overthecam.store.domain.StoreItem;
import com.overthecam.store.domain.StorePurchase;
import com.overthecam.store.dto.StoreAllItemsResponseDto;
import com.overthecam.store.repository.StoreItemRepository;
import com.overthecam.store.repository.StorePurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreItemService {

    private final StoreItemRepository storeItemRepository;
    private final StorePurchaseRepository storePurchaseRepository;
    private final UserRepository userRepository;

    public List<StoreAllItemsResponseDto> getAllItems() {

        List<StoreItem> items = storeItemRepository.findAllByOrderByCreatedAtDesc();

        if (items.isEmpty()) {
            throw new GlobalException(StoreErrorCode.STORE_ITEM_NOT_PURCHASE, "등록된 상품이 없습니다.");
        }

        return items.stream()
                .map(item -> new StoreAllItemsResponseDto(
                        item.getId(),
                        item.getImageUrl(),
                        item.getName(),
                        item.getPrice(),
                        item.getDetail(),
                        item.getType()
                ))
                .collect(Collectors.toList());
    }


    public List<StoreAllItemsResponseDto> getMyItems(Long userId) {

        List<StoreItem> items = storeItemRepository.findAllUserItems(userId);

        if (items.isEmpty()) {
            throw new GlobalException(StoreErrorCode.STORE_ITEM_NOT_FOUND, "구매한 상품이 없습니다.");
        }

        return items.stream()
                .map(item -> StoreAllItemsResponseDto.builder()
                        .storeItemId(item.getId())
                        .name(item.getName())
                        .price(item.getPrice())
                        .detail(item.getDetail())
                        .imageUrl(item.getImageUrl())
                        .type(item.getType())
                        .build())
                .collect(Collectors.toList());

    }

    public void purchaseItem(Long storeItemId, Long userId) {
        //타임 제외하고는 모든 아이템은 중복 구매가 안되는 로직 설정
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));


        StoreItem item = storeItemRepository.findById(storeItemId)
                .orElseThrow(() -> new GlobalException(StoreErrorCode.STORE_ITEM_NOT_FOUND, "등록된 상품이 없습니다."));


        if (item.getType() != ItemType.TIME) {
            if (storePurchaseRepository.existsByUserIdAndStoreItemId(userId, storeItemId)) {
                throw new GlobalException(StoreErrorCode.ALREADY_PURCHASED_ITEM, "해당 상품은 중복구매가 불가능합니다.");
            }
        }

        StorePurchase storePurchase = StorePurchase.createStorePurchase(user, item);
        storePurchaseRepository.save(storePurchase);

    }
}
