package com.overthecam.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 잘못된 요청 (400)
    BAD_REQUEST("400", "001", "잘못된 요청입니다.", false),
    EMPTY_FILE("400", "002", "파일이 비어있습니다.", false),
    NOT_IMAGE_FILE("400", "003", "이미지 파일만 업로드 가능합니다.", false),
    OVER_MAX_SIZE("400", "004", "파일 크기는 10MB를 초과할 수 없습니다.", false),

    // 인증 관련 에러 (401)
    TOKEN_EXPIRED("401", "001", "토큰이 만료되었습니다.", false),
    TOKEN_NOT_FOUND("401", "002", "토큰이 없습니다.", false),

    // 권한 없음 (403)
    FORBIDDEN("403", "001", "권한이 없습니다.", false),

    // 리소스 없음 (404)
    NOT_FOUND("404", "001", "리소스를 찾을 수 없습니다.", false),

    // 리소스 충돌 (409)
    CONFLICT("409", "001", "리소스가 충돌되었습니다.", false),
    DUPLICATE_LIKE("409", "002", "중복된 아이템 구매 요청입니다.", false),

    // 서버 에러 (500)
    SERVER_ERROR("500", "001", "서버 에러가 발생했습니다.", false);

    private final String statusCode;
    private final String code;
    private final String message;
    private final boolean success;

}