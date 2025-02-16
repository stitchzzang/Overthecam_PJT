package com.overthecam.websocket.service;

import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.dto.BattleBettingInfo;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.member.service.UserScoreService;
import com.overthecam.redis.repository.BattleVoteRedisRepository;
import com.overthecam.redis.service.UserScoreRedisService;
import com.overthecam.websocket.dto.BattleData;
import com.overthecam.websocket.dto.BattlerNotificationDto;
import com.overthecam.websocket.dto.ParticipantInfo;
import com.overthecam.websocket.exception.WebSocketErrorCode;
import com.overthecam.websocket.exception.WebSocketException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleStartService {

    private final BattleReadyService battleReadyService;
    private final BattleVoteService battleVoteService;
    private final UserScoreRedisService userScoreRedisService;
    private final UserScoreService userScoreService;

    private final BattleRepository battleRepository;
    private final BattleParticipantRepository participantRepository;
    private final BattleVoteRedisRepository battleVoteRedisRepository;

    @Transactional
    public void updateBattleStatus(Long battleId, Status status) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new WebSocketException(WebSocketErrorCode.BATTLE_NOT_FOUND, "배틀을 찾을 수 없습니다."));
        battle.updateStatus(status);
        log.info("Battle status updated - battleId: {}, status: {}", battleId, status);
        battleRepository.save(battle);
    }

    @Transactional
    public BattleData handleBattleStart(Long battleId) {
        if (!battleReadyService.canStartBattle(battleId)) {
            throw new GlobalException(BattleErrorCode.INVALID_BATTLE_START, "모든 참가자가 준비되지 않았습니다.");
        }

        // 모든 참가자의 점수 정보를 초기화
        List<ParticipantInfo> participants = initializeAllParticipantsScore(battleId);

        return BattleData.builder()
            .battleId(battleId)
            .voteInfo(battleVoteService.getVoteInfo(battleId))
            .participants(participants)
            .build();
    }

    private List<ParticipantInfo> initializeAllParticipantsScore(Long battleId) {
        List<BattleParticipant> battleParticipants = participantRepository.findAllByBattleIdWithUser(battleId);

        return battleParticipants.stream()
            .map(participant -> {
                // 각 참가자의 점수 정보 조회 및 캐싱
                UserScoreInfo userScore = userScoreService.getUserScore(participant.getUser().getId())
                    .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

                // Redis에 점수 정보 캐싱
                UserScoreInfo cachedScore = userScoreRedisService.initializeBattleScore(
                    battleId,
                    participant.getUser().getId(),
                    userScore
                );

                // ParticipantInfo 생성 시 점수 정보 포함
                return ParticipantInfo.builder()
                    .userId(participant.getUser().getId())
                    .nickname(participant.getUser().getNickname())
                    .profileImage(participant.getUser().getProfileImage())
                    .role(participant.getRole())
                    .supportScore(cachedScore.getSupportScore())
                    .point(cachedScore.getPoint())
                    .build();
            })
            .collect(Collectors.toList());
    }


    public BattlerNotificationDto getBattlerNotification(Long battleId) {
        List<BattleParticipant> battlers = participantRepository.findAllByBattleIdWithUser(battleId).stream()
                .filter(p -> ParticipantRole.isBattler(p.getRole()))
                .collect(Collectors.toList());

        List<BattleBettingInfo> battlerVotes = battleVoteRedisRepository.getAllVotes(battleId).stream()
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
                .orElseThrow(() -> new WebSocketException(WebSocketErrorCode.BATTLER_VOTE_NOT_FOUND, "배틀러의 투표 옵션을 찾을 수 없습니다."));

        return BattlerNotificationDto.BattlerInfo.builder()
                .userId(battler.getUser().getId())
                .nickname(battler.getUser().getNickname())
                .optionId(vote.getVoteOptionId())
                .build();
    }

}
