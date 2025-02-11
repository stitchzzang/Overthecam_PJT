package com.overthecam.battle.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum ParticipantRole {
    HOST(1),
    PARTICIPANT(2),
    HOST_PARTICIPANT(3),
    BATTLER(4),
    HOST_BATTLER(5),
    PARTICIPANT_BATTLER(6);

    private final int value;

    ParticipantRole(int value) {
        this.value = value;
    }

    // 현재 role에 배틀러 권한을 추가하는 메서드
    public static ParticipantRole addBattlerRole(ParticipantRole currentRole) {
        if (isHost(currentRole)) {
            return HOST_BATTLER;
        } else if (isParticipant(currentRole)) {
            return PARTICIPANT_BATTLER;
        }
        return BATTLER;
    }

    public static boolean isBattler(ParticipantRole role) {
        return role == BATTLER || role == HOST_BATTLER || role == PARTICIPANT_BATTLER;
    }

    public static boolean isParticipant(ParticipantRole role) {
        return role == PARTICIPANT || role == HOST_PARTICIPANT || role == PARTICIPANT_BATTLER;
    }

    public static boolean isHost(ParticipantRole role) {
        return role == HOST || role == HOST_PARTICIPANT || role == HOST_BATTLER;
    }

    public static ParticipantRole fromValue(int value) {
        for (ParticipantRole role : values()) {
            if (role.value == value) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role value: " + value);
    }

    public int getValue() {
        return value;
    }

    @Converter(autoApply = true)
    public static class ParticipantRoleConverter implements AttributeConverter<ParticipantRole, Integer> {
        @Override
        public Integer convertToDatabaseColumn(ParticipantRole role) {
            return role == null ? null : role.getValue();
        }

        @Override
        public ParticipantRole convertToEntityAttribute(Integer value) {
            if (value == null) {
                return null;
            }
            return fromValue(value);
        }
    }
}