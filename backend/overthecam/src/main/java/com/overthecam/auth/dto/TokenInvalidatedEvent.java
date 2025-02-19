package com.overthecam.auth.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class TokenInvalidatedEvent {
    private final String token;
    private final Long userId;
}
