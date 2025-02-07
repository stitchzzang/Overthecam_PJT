package com.overthecam.exception.store;

import com.overthecam.exception.ErrorCode;
import com.overthecam.exception.GlobalException;

public class StoreException extends GlobalException {
    public StoreException(ErrorCode errorCode, String detail) {
        super(errorCode, detail);
    }
}
