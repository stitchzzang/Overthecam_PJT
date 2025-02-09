package com.overthecam.store.controller;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.security.util.SecurityUtils;
import com.overthecam.store.dto.StoreAllItemsResponseDto;
import com.overthecam.store.service.StoreItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store/item")
@RequiredArgsConstructor
@Slf4j
public class StoreItemController {
    private final StoreItemService storeItemService;
    private final SecurityUtils securityUtils;

    /**
     * 아이템 목록 조회
     */
    @GetMapping("/all")
    public CommonResponseDto<List<StoreAllItemsResponseDto>> getAllItems() {
        List<StoreAllItemsResponseDto> items = storeItemService.getAllItems();
        return CommonResponseDto.ok(items);
    }

    /**
     * 내 아이템 목록 조회
     */
    @GetMapping("/my/all")
    public CommonResponseDto<List<StoreAllItemsResponseDto>> getMyItems(Authentication authentication) {

        Long userId = securityUtils.getCurrentUserId(authentication);
        List<StoreAllItemsResponseDto> items = storeItemService.getMyItems(userId);
        return CommonResponseDto.ok(items);
    }

    /**
     * 아이템 구매
     * 포인트로 차감
     * 구매하지 않았습니다
     */

    @PostMapping("{storeItemId}/purchase")
    public CommonResponseDto purchaseItem(Authentication authentication, @PathVariable("storeItemId") Long storeItemId) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        storeItemService.purchaseItem(storeItemId, userId);
        return CommonResponseDto.ok();
    }


}
