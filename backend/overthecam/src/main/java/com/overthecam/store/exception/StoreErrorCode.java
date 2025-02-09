package com.overthecam.store.exception;

import com.overthecam.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StoreErrorCode implements ErrorCode {

    STORE_ITEM_NOT_FOUND(404, "상품을 찾을 수 없습니다."),
    ALREADY_PURCHASED_ITEM(409, "이미 구매한 상품입니다."),
    STORE_ITEM_NOT_PURCHASE(404, "구매한 상품이 없습니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }

}
