package com.overthecam.battle.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.BalanceGame;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.dto.*;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BalanceGameRepository;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.vote.repository.VoteRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BattleService {

    private final BattleRepository battleRepository;
    private final BattleParticipantRepository battleParticipantRepository;
    private final BalanceGameRepository balanceGameRepository;

    private final UserRepository userRepository;
    private final LiveKitTokenService liveKitService;


    /**
     * 배틀방 생성
     */
    @Transactional
    public BattleRoomResponse createBattleRoom(Long userId, String roomName, String participantName) throws Exception {
        User user = getUserById(userId);
        String token = liveKitService.createToken(user, participantName, roomName, ParticipantRole.HOST);
        Battle battle = createInitialBattle(roomName);
        createHostParticipant(battle, user);

        return BattleRoomResponse.builder()
            .battleId(battle.getId())
            .token(token)
            .roomName(roomName)
            .build();
    }

    /**
     * 배틀방 참가
     */
    @Transactional
    public BattleRoomResponse joinBattleRoom(Long battleId, Long userId, String participantName) throws Exception {
        User user = getUserById(userId);
        Battle battle = getBattleById(battleId);
        String token = liveKitService.createToken(user, participantName, battle.getTitle(), ParticipantRole.PARTICIPANT);

        createParticipant(battle, user);
        updateBattleParticipants(battle);

        return BattleRoomResponse.builder()
            .battleId(battleId)
            .token(token)
            .roomName(battle.getTitle())
            .build();
    }

    /**
     * 배틀방 초기 생성
     */
    private Battle createInitialBattle(String roomName) {
        Battle battle = Battle.builder()
            .title(roomName)
            .roomUrl("roomurl:roomurl")
            .thumbnailUrl("https://d26tym50939cjl.cloudfront.net/thumbnails/thumbnail+1.png")
            .totalUsers(1)
            .status(Status.WAITING)
            .build();
        return battleRepository.save(battle);
    }

    /**
     * 호스트 참가자 생성
     */
    private void createHostParticipant(Battle battle, User user) {
        BattleParticipant host = BattleParticipant.builder()
            .battle(battle)
            .user(user)
            .role(ParticipantRole.HOST)
            .build();
        battleParticipantRepository.save(host);
    }

    /**
     * 일반 참가자 생성
     */
    private void createParticipant(Battle battle, User user) {
        BattleParticipant participant = BattleParticipant.builder()
            .battle(battle)
            .user(user)
            .role(ParticipantRole.PARTICIPANT)
            .build();
        battleParticipantRepository.save(participant);
    }

    /**
     * 배틀방 참가자 수 업데이트
     */
    private void updateBattleParticipants(Battle battle) {
        battle.updateTotalUsers(battle.getTotalUsers() + 1);
        battleRepository.save(battle);
    }

    /**
     * 배틀러 선정
     */
    @Transactional
    public void selectBattlers(Long battleId, Long battler1Id, Long battler2Id) {
        validateBattlers(battler1Id, battler2Id);
        List<BattleParticipant> participants = battleParticipantRepository.findAllByBattleIdWithUser(battleId);

        int updatedCount = 0;

        for (BattleParticipant participant : participants) {
            Long userId = participant.getUser().getId();

            if (userId.equals(battler1Id) || userId.equals(battler2Id)) {
                ParticipantRole newRole = ParticipantRole.addBattlerRole(participant.getRole());
                participant.updateRole(newRole);
                battleParticipantRepository.save(participant);

                updatedCount++;

                log.info("배틀러 권한 추가 | userId: {}, 이전 역할: {}, 새로운 역할: {}",
                    userId, participant.getRole(), newRole);
            }
        }

        if (updatedCount != 2) {
            log.error("배틀러 선정 실패 | battleId: {}, battler1Id: {}, battler2Id: {}",
                battleId, battler1Id, battler2Id);
            throw new GlobalException(BattleErrorCode.FAIL_BATTLER_SELECT,
                "배틀러 선정에 실패했습니다. 해당 사용자가 배틀방에 참여하고 있는지 확인해주세요.");
        }
    }

    private void validateBattlers(Long battler1Id, Long battler2Id) {
        if (battler1Id == null || battler2Id == null) {
            throw new GlobalException(BattleErrorCode.MISSING_REQUIRED_FIELD,
                "배틀러 정보가 누락되었습니다. 두 명의 배틀러 정보를 모두 입력해주세요.");
        }
        if (battler1Id.equals(battler2Id)) {
            throw new GlobalException(BattleErrorCode.INVALID_BATTLER_SELECT,
                "동일한 사용자를 배틀러로 선택할 수 없습니다. 서로 다른 참가자를 선택해주세요.");
        }
    }

    /**
     * 사용자 퇴장 처리
     */
    @Transactional
    public void handleUserLeave(Long battleId, Long userId) {
        Battle battle = getBattleById(battleId);
        long currentParticipants = battleParticipantRepository.countByBattleId(battleId);

        log.info("Battle {} 현재 참가자 수 조회: {}", battleId, currentParticipants);

        battleParticipantRepository.deleteByBattleIdAndUserId(battleId, userId);

        long remainingParticipants = battleParticipantRepository.countByBattleId(battleId);
        log.info("Battle {} 남은 참가자 수: {}", battleId, remainingParticipants);

        if (remainingParticipants <= 0) {
            battleRepository.delete(battle);
            log.info("배틀룸 {} 인원이 0명이 되어 삭제되었습니다.", battleId);
            return;
        }

        updateBattleStatus(battle, remainingParticipants);
    }

    /**
     * 배틀방 상태 업데이트
     */
    private void updateBattleStatus(Battle battle, long participants) {
        battle.updateTotalUsers((int) participants);

        if (participants < 6 && battle.getStatus() != Status.END) {
            battle.updateStatus(Status.WAITING);
            log.info("배틀룸 {} 인원이 6명 미만이 되어 상태가 WAITING으로 변경되었습니다.", battle.getId());
        }

        battleRepository.save(battle);
    }

    /**
     * 모든 배틀방 조회
     */
    @Transactional
    public BattleRoomAllResponse getAllBattleRooms() {
        List<Battle> battles = battleRepository.findByStatusInOrderByCreatedAtDesc(
            Arrays.asList(Status.WAITING, Status.PROGRESS)
        );

        List<BattleInfo> battleInfos = battles.stream()
            .map(battle -> {
//                if (battle.getTotalUsers() >= 6 && battle.getStatus() != Status.END) {
//                    battle.updateStatus(Status.PROGRESS);
//                    battleRepository.save(battle);
//                    log.info("배틀룸 {} 인원이 6명이 되어 상태가 PROGRESS로 변경되었습니다.", battle.getId());
//                }

                return BattleInfo.builder()
                    .battleId(battle.getId())
                    .thumbnailUrl(battle.getThumbnailUrl())
                    .title(battle.getTitle())
                    .status(battle.getStatus())
                    .totalUsers(battle.getTotalUsers())
                    .build();
            })
            .collect(Collectors.toList());

        return BattleRoomAllResponse.builder()
            .battleInfo(battleInfos)
            .build();
    }

    /**
     * 랜덤 주제 생성
     */
    public RandomVoteTopicResponse createRandomVoteTopic() {
        // JPQL을 사용하여 랜덤 레코드 조회
        BalanceGame randomTopic = balanceGameRepository.findRandomBalanceGame()
            .orElseThrow(() -> new GlobalException(BattleErrorCode.TOPIC_GENERATION_FAILED,
                "랜덤 주제 생성에 실패했습니다"));

        // 주제 형식에 맞게 문자열 구성
        String formattedTopic = String.format("%s\n• %s\n• %s",
            randomTopic.getQuestion(),
            randomTopic.getOption1(),
            randomTopic.getOption2());

        return RandomVoteTopicResponse.builder()
            .title(formattedTopic)
            .build();
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Battle getBattleById(Long battleId) {
        return battleRepository.findById(battleId)
            .orElseThrow(() -> new RuntimeException("Battle not found"));
    }
}