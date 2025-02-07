package com.overthecam.battle.domain;

public enum Status {
    WAITING(0),
    PROGRESS(1),
    END(2);

    private final int code;

    Status(int code) {
        this.code = code;
    }

    public int getCode() {
        return this.code;
    }
}