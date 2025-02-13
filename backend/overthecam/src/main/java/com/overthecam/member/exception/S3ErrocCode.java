package com.overthecam.member.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum S3ErrocCode implements ErrorCode {
    FILE_EMPTY(404, "파일이 비어있습니다."),
    FILE_SIZE_EXCEED(404, "파일 크기가 제한을 초과했습니다."),
    INVALID_FILE_TYPE(404, "지원하지 않는 파일 형식입니다."),
    S3_UPLOAD_ERROR(500, "파일 업로드 중 오류가 발생했습니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }


}
