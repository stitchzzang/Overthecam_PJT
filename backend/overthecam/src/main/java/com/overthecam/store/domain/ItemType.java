package com.overthecam.store.domain;

import lombok.Getter;

@Getter
public enum ItemType {
    FRAME(0, "프레임"),
    MASK(1, "가면"),
    EFFECT(2, "효과음"),
    TIME(3, "시간");

    private final int code;
    private final String description;

    ItemType(int code, String description) {
        this.code = code;
        this.description = description;
    }

}
