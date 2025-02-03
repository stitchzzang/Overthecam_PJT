package com.overthecam.battle.domain;

public class ParticipantRole {
    //000: 각 자리수에 1이 있으면 그 역할을 담당하는 것 111은 될 수 없음.
    public static final int HOST = 1;        // 001방장
    public static final int PARTICIPANT = 2;  // 010 일반 참가자
    public static final int BATTLER = 4;      // 100 배틀러

    // 역할 체크 메서드들
    public static boolean isHost(int role) {
        return role == HOST;
    }

    public static boolean isParticipant(int role) {
        return role == PARTICIPANT;
    }

    public static boolean isBattler(int role) {
        return (role & BATTLER) != 0;  // 배틀러는 기존 역할과 함께 가질 수 있음
    }
}
