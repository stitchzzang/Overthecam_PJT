package com.overthecam.store.controller;

import com.overthecam.store.dto.StoreItemResponseDto;
import com.overthecam.store.service.StoreItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/store/items")
@RequiredArgsConstructor
@Slf4j
public class StoreItemController {
    private final StoreItemService storeItemService;

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<StoreItemResponseDto>>> getAllItems() {

        List<StoreItemResponseDto> items = storeItemService.getAllItems();
        log.info("Retrieved items: {}", items);
        return ResponseEntity.ok(
                ApiResponse.<List<StoreItemResponseDto>>builder()
                        .success(true)
                        .statusCode(HttpStatus.OK.value())
                        .message("모든 상점 아이템 목록 조회 성공")
                        .data(items)
                        .build()
        );
    }

}
