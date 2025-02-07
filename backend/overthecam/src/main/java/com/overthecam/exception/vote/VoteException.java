package com.overthecam.exception.vote;

import com.overthecam.exception.ErrorCode;
import lombok.Getter;

@Getter
public class VoteException extends RuntimeException {
    private final VoteErrorCode errorCode;

    public VoteException(VoteErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public VoteException(VoteErrorCode errorCode, String detail) {
        super(detail);
        this.errorCode = errorCode;
    }

    @Override
    public String getMessage() {
        if (super.getMessage() == null) {
            return errorCode.getMessage();
        }
        return String.format("[%s] %s - %s", errorCode.getCode(), errorCode.getMessage(), super.getMessage());
    }
}