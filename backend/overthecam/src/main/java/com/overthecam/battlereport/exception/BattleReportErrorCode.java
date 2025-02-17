package com.overthecam.battlereport.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BattleReportErrorCode implements ErrorCode {
    REPORT_GENERATION_FAILED(500, "리포트 생성에 실패했습니다."),
    ANALYSIS_DATA_NOT_FOUND(404, "분석 데이터를 찾을 수 없습니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }

    @Override
    public int getStatus() {
        return status;
    }

    @Override
    public String getMessage() {
        return message;
    }
}