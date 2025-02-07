package com.overthecam.websocket.service;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.websocket.dto.ChatMessageResponse;
import com.overthecam.websocket.dto.ParticipantInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleWebsocketService {
    private final BattleRepository battleRepository;
    private final BattleParticipantRepository participantRepository;

    @Transactional
    public Battle updateBattleStatus(Long battleId, Status status) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("Battle not found"));
        battle.updateStatus(status);
        log.info("Battle status updated - battleId: {}, status: {}", battleId, status);
        return battleRepository.save(battle);
    }

    public List<ParticipantInfo> getParticipants(Long battleId) {
        return participantRepository.findAllByBattleIdWithUser(battleId).stream()
                .map(this::convertToParticipantInfo)
                .collect(Collectors.toList());
    }

    public ChatMessageResponse getBattlerNotification(Long battleId) {
        List<String> battlerNames = participantRepository.findAllByBattleIdWithUser(battleId).stream()
                .filter(p -> ParticipantRole.isBattler(p.getRole()))
                .map(p -> p.getUser().getNickname())
                .toList();

        return ChatMessageResponse.builder()
                .nickname("System")
                .content(String.format("%s님과 %s님 배틀러 선정!\n건강하고 유쾌한 논쟁 되시길 바랍니다!",
                        battlerNames.get(0), battlerNames.get(1)))
                .timestamp(LocalDateTime.now())
                .build();
    }

    private ParticipantInfo convertToParticipantInfo(BattleParticipant participant) {
        return new ParticipantInfo(
                participant.getUser().getId(),
                participant.getUser().getNickname(),
                participant.getUser().getProfileImage(),
                participant.getRole(),
                participant.getConnectionToken()
        );
    }
}
