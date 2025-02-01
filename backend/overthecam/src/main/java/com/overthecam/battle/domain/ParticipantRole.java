package com.overthecam.battle.domain;

public class ParticipantRole {
    //000: 각 자리수에 1이 있으면 그 역할을 담당하는 것
    public static final int HOST = 1;        // 2^0 = 1 = 001 역할이 방장만!인 경우
    public static final int BATTLER = 2;     // 2^1 = 2 = 010 역할이 배틀러만!인 경우
    public static final int PARTICIPANT = 4;  // 2^2 = 4 = 100 역할이 참여자만!인 경우

    // 역할 체크 메서드들
    public static boolean isHost(int role) {
        return (role & HOST) != 0;
    }

    public static boolean isBattler(int role) {
        return (role & BATTLER) != 0;
    }

    public static boolean isParticipant(int role) {
        return (role & PARTICIPANT) != 0;
    }

    // 역할 추가 메서드
    public static int addRole(int currentRole, int newRole) {
        return currentRole | newRole;
    }

    // 역할 제거 메서드
    public static int removeRole(int currentRole, int roleToRemove) {
        return currentRole & ~roleToRemove;
    }

}
