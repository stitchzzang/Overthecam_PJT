package com.overthecam.search.dto;

import com.overthecam.auth.domain.User;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Builder
@Data
public class UserSearchResponse {
    private List<UserInfo> userInfo;  // UserInfo 리스트로 변경
    private int totalPages;
    private int currentPage;
    private boolean hasNext;

    public static UserSearchResponse of(Page<User> userPage) {
        return UserSearchResponse.builder()
                .userInfo(userPage.getContent().stream()
                        .map(UserInfo::from)
                        .collect(Collectors.toList()))
                .totalPages(userPage.getTotalPages())
                .currentPage(userPage.getNumber())
                .hasNext(userPage.hasNext())
                .build();
    }
}
