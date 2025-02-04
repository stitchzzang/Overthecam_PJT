package com.overthecam.exception.vote;

import com.overthecam.exception.ErrorCode;
import lombok.Getter;

@Getter
public class VoteException extends RuntimeException {
    private final VoteErrorCode errorCode;
    private final String detail;

    public VoteException(VoteErrorCode errorCode) {
        this(errorCode, errorCode.getMessage());
    }

    public VoteException(VoteErrorCode errorCode, String detail) {
        super(detail);
        this.errorCode = errorCode;
        this.detail = detail;
    }

    @Override
    public String getMessage() {
        return String.format("[%s] %s - %s", errorCode.getCode(), errorCode.getMessage(), detail);
    }
}