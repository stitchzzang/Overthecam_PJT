package com.overthecam.websocket.service;

import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.battle.repository.BattleVoteRedisRepository;
import com.overthecam.websocket.dto.BattlerNotificationDto;
import com.overthecam.websocket.dto.ParticipantInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleWebsocketService {

    private final BattleRepository battleRepository;
    private final BattleParticipantRepository participantRepository;
    private final BattleVoteRedisRepository battleVoteRedisRepository;

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

    public BattlerNotificationDto getBattlerNotification(Long battleId) {
        List<BattleParticipant> battlers = participantRepository.findAllByBattleIdWithUser(battleId).stream()
                .filter(p -> ParticipantRole.isBattler(p.getRole()))
                .collect(Collectors.toList());

        if (battlers.size() != 2) {
            throw new RuntimeException("Invalid number of battlers");
        }

        List<BattleBettingInfo> battlerVotes = battleVoteRedisRepository.getAllVotesForBattle(battleId).stream()
                .filter(BattleBettingInfo::isBattler)
                .collect(Collectors.toList());

        return BattlerNotificationDto.builder()
                .firstBattler(createBattlerInfo(battlers.get(0), battlerVotes))
                .secondBattler(createBattlerInfo(battlers.get(1), battlerVotes))
                .build();
    }

    private BattlerNotificationDto.BattlerInfo createBattlerInfo(
            BattleParticipant battler,
            List<BattleBettingInfo> battlerVotes) {

        BattleBettingInfo vote = battlerVotes.stream()
                .filter(v -> v.getUserId().equals(battler.getUser().getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Battler vote not found"));

        return BattlerNotificationDto.BattlerInfo.builder()
                .userId(battler.getUser().getId())
                .nickname(battler.getUser().getNickname())
                .optionId(vote.getVoteOptionId())
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
