package com.overthecam.websocket.dto;

public enum MessageType {

    // WebSocket 통신
    CONNECT, // 웹소켓 연결
    SUBSCRIBE, // 구독

    // 브로드캐스트 메시지
    CHAT,            // 채팅
    BATTLE_START,    // 배틀 시작 (초기 데이터)
    BATTLER_SELECT,  // 배틀러 선정
    VOTE_CREATE,     // 투표 입력

    // 개인 메시지
    USER_SCORE,      // 사용자 총 점수
    CHEER_UPDATE,    // 응원 점수
    POINT_UPDATE,    // 포인트
    VOTE_UPDATE,     // 투표

    // 시스템 알림
    ERROR,           // 에러 메시지
    SYSTEM_INVITE    // 회원 초대

}
