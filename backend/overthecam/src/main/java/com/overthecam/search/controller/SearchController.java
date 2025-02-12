package com.overthecam.search.controller;

import com.overthecam.battle.dto.BattleRoomAllResponse;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.search.dto.UserSearchResponse;
import com.overthecam.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    /**
     * 제목으로 배틀 검색
     */
    @GetMapping("/battle")
    public CommonResponseDto<BattleRoomAllResponse> searchBattles(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size  // 2x5 그리드에 최적화
    ) {
        BattleRoomAllResponse response = searchService.searchBattles(keyword, page, size);
        return CommonResponseDto.ok(response);

    }


    /**
     * 닉네임으로 유저 검색
     */
    @GetMapping("/user")
    public CommonResponseDto<UserSearchResponse> searchUsers(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size  // 2x5 그리드에 최적화
    ) {

        UserSearchResponse response = searchService.searchUsers(keyword, page, size);
        return CommonResponseDto.ok(response);

    }


}
