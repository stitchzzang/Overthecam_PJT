//package com.overthecam.exception.battle;
//
//import lombok.Getter;
//import lombok.RequiredArgsConstructor;
//
//@Getter
//@RequiredArgsConstructor
//public enum BattleErrorCode {
//    // Battle 기본 에러
//    BATTLE_NOT_FOUND("BTL-001", "배틀이 존재하지 않습니다"),
//    BATTLE_ALREADY_STARTED("BTL-002", "이미 시작된 배틀입니다"),
//    INVALID_PARTICIPANT_COUNT("BTL-003", "참가자 수가 올바르지 않습니다"),
//
//    // Battle 제목/주제 관련 에러
//    TOPIC_GENERATION_FAILED("BTL-101", "주제 생성에 실패했습니다"),
//    BATTLE_TITLE_UPDATE_FAILED("BTL-102", "방제 변경에 실패했습니다"),
//
//    // OpenVidu 관련 에러
//    OPENVIDU_CONNECTION_ERROR("BTL-201", "OpenVidu 서버 연동 중 오류가 발생했습니다"),
//    OPENVIDU_SESSION_ERROR("BTL-202", "OpenVidu 세션 생성에 실패했습니다");
//
//    private final String code;
//    private final String message;
//}