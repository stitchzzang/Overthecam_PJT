package com.overthecam.search.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.dto.BattleRoomAllResponse;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.search.dto.UserSearchResponse;
import com.overthecam.search.exception.SearchErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class SearchService {

    private final BattleRepository battleRepository;
    private final UserRepository userRepository;

    public BattleRoomAllResponse searchBattles(String keyword, int page, int size) {
        log.info("검색 키워드: {}", keyword);
        // 빈 문자열이 아니라면
        if (keyword != null && keyword.trim().isEmpty()) {
            throw new GlobalException(SearchErrorCode.EMPTY_KEYWORD, "검색어를 입력해주세요.");
        }

        Pageable pageable = PageRequest.of(page, size);

        // SELECT * FROM battle WHERE title LIKE '%keyword%'
        Page<Battle> battlePage = battleRepository.findByTitleContainingIgnoreCase(keyword.trim(), pageable);

        log.info("검색 결과 수: {}", battlePage.getTotalElements());

        return BattleRoomAllResponse.of(battlePage);
    }

    public UserSearchResponse searchUsers(String keyword, int page, int size) {

        log.info("검색 키워드: {}", keyword);
        // 빈 문자열 체크
        if (keyword != null && keyword.trim().isEmpty()) {
            throw new GlobalException(SearchErrorCode.EMPTY_KEYWORD, "검색어를 입력해주세요");
        }

        // 페이징 처리를 위한 객체 생성
        Pageable pageable = PageRequest.of(page, size);

        // JPA 쿼리 실행 - 닉네임으로 유저 검색
        Page<User> userPage = userRepository.findByNicknameContainingIgnoreCase(
                keyword.trim(),
                pageable
        );

        return UserSearchResponse.of(userPage);
    }

}
