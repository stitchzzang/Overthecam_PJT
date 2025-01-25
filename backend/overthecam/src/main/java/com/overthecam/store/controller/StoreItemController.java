package com.overthecam.store.controller;

import com.overthecam.store.dto.StoreItemResponseDto;
import com.overthecam.store.service.StoreItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/store/items")
@RequiredArgsConstructor
public class StoreItemController {
    private final StoreItemService storeItemService;

    @GetMapping("/all")
    public ResponseEntity<List<StoreItemResponseDto>> getAllItems() {
        return ResponseEntity.ok(storeItemService.getAllItems());
    }
}
