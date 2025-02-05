//package com.overthecam.exception.battle;
//
//import lombok.Getter;
//
//@Getter
//public class BattleException extends RuntimeException {
//    private final BattleErrorCode errorCode;
//    private final String detail;
//
//    public BattleException(BattleErrorCode errorCode, String detail) {
//        super(errorCode.getMessage());
//        this.errorCode = errorCode;
//        this.detail = detail;
//    }
//}