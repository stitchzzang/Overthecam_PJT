package com.overthecam.battle.service;

import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.dto.BattleInfo;
import com.overthecam.battle.dto.BattleRoomAllResponse;
import com.overthecam.battle.dto.RandomVoteTopicResponse;
import com.overthecam.battle.dto.SelectBattlerResponse;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleService {

    //private final OpenViduService openViduService;
    private final BattleRepository battleRepository;
    private final BattleParticipantRepository battleParticipantRepository;
    private final UserRepository userRepository;

    private final String[] topics = {
            "더 괴로운 상황은?\n" +
                    "• 나 빼고 모두가 브레인인 팀에서 자괴감 느끼기\n" +
                    "• 내가 유일한 브레인인 팀에서 혼자 일하기",

            "똥 쌌는데, 더 괴로운 상황은?\n" +
                    "• 썸남썸녀 집 변기 막기\n" +
                    "• 싸피 변기 막고 소문나기",

            "더 끔찍한 상황은?\n" +
                    "• 회사 송년회에서 깜짝 고백 받기\n" +
                    "• 전 애인이 회사 사람들 앞에서 울며 매달리기",

            "애인의 더 거슬리는 모습은?\n" +
                    "• 쩝쩝 소리내기\n" +
                    "• 식탐 부리기",

            "배우자가 또 도박해서 5억을 따왔다면?\n" +
                    "• 이혼한다.\n" +
                    "• 용서한다.",

            "더 최악은?\n" +
                    "• 내가 준 선물 당근에 판매\n" +
                    "• 내게 줄 선물 당근에서 구매",

            "소개팅에서 만취 후 다음 날 눈 떴을 때 더 최악의 장소는?\n" +
                    "• 나 홀로 공원 벤치\n" +
                    "• 나 홀로 MT"
    };


    /**
     * 배틀러 선정 메서드
     */
    @Transactional
    public SelectBattlerResponse selectBattlers(Long battleId, String battler1, String battler2) {
        // 해당 배틀의 모든 참가자 조회
        List<BattleParticipant> participants = battleParticipantRepository.findAllByBattleIdWithUser(battleId);

        SelectBattlerResponse response = null;
        int updatedCount = 0;

        for (BattleParticipant participant : participants) {
            String nickname = participant.getUser().getNickname();

            if (nickname.equals(battler1) || nickname.equals(battler2)) {
                // 현재 역할을 유지하면서 배틀러 권한 추가
                ParticipantRole newRole = ParticipantRole.addBattlerRole(participant.getRole());
                participant.updateRole(newRole);
                battleParticipantRepository.save(participant);

                response = new SelectBattlerResponse(
                        nickname,
                        newRole  // 새로운 역할 (HOST_BATTLER, PARTICIPANT_BATTLER, 또는 BATTLER)
                );
                updatedCount++;

                log.info("배틀러 권한 추가 | 닉네임: {}, 이전 역할: {}, 새로운 역할: {}",
                        nickname, participant.getRole(), newRole);
            }
        }

        if (updatedCount != 2) {
            log.error("배틀러 선정 실패 | battleId: {}, battler1: {}, battler2: {}",
                    battleId, battler1, battler2);
            throw new RuntimeException("배틀러 선정에 실패했습니다. 지정된 닉네임을 찾을 수 없습니다.");
        }

        log.info("배틀러 선정 완료 | battleId: {}, 선정된 배틀러: {} vs {}",
                battleId, battler1, battler2);

        return response;

    }


    public RandomVoteTopicResponse createRandomVoteTopic() {
        int randomIdx = (int) (Math.random() * topics.length);

        return RandomVoteTopicResponse.builder()
                .title(topics[randomIdx])
                .build();
    }

    @Transactional
    public BattleRoomAllResponse getAllBattleRooms() {
        // status 0, 1인 배틀방만 최신순으로 조회
        List<Battle> battles = battleRepository.findByStatusInOrderByCreatedAtDesc(Arrays.asList(Status.WAITING, Status.PROGRESS));

        List<BattleInfo> battleInfos = battles.stream()
                .map(battle -> {
                    // 6명이 된 방은 상태를 COMPLETED로 변경
                    if (battle.getTotalUsers() >= 6 && battle.getStatus() != Status.END) {
                        battle.updateStatus(Status.PROGRESS);
                        battleRepository.save(battle);
                        log.info("배틀룸 {} 인원이 6명이 되어 상태가 COMPLETED로 변경되었습니다.", battle.getId());
                    }

                    return BattleInfo.builder()
                            .battleId(battle.getId())
                            .thumbnailUrl(battle.getThumbnailUrl())
                            .title(battle.getTitle())
                            .status(battle.getStatus().getCode())
                            .totalUsers(battle.getTotalUsers())
                            .build();
                })
                .collect(Collectors.toList());

        return BattleRoomAllResponse.builder()
                .battleInfo(battleInfos)
                .build();
    }


    @Transactional
    public void handleUserLeave(Long battleId, Long userId) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("배틀룸을 찾을 수 없습니다."));

        // 현재 참가자 수를 직접 조회
        long currentParticipants = battleParticipantRepository.countByBattleId(battleId);
        log.info("Battle {} 현재 참가자 수 조회: {}", battleId, currentParticipants);

        // 해당 유저의 참가 정보 삭제
        battleParticipantRepository.deleteByBattleIdAndUserId(battleId, userId);

        // 참가자 삭제 후 남은 참가자 수 재조회
        long remainingParticipants = battleParticipantRepository.countByBattleId(battleId);
        log.info("Battle {} 남은 참가자 수: {}", battleId, remainingParticipants);

        if (remainingParticipants <= 0) {
            battleRepository.delete(battle);
            log.info("배틀룸 {} 인원이 0명이 되어 삭제되었습니다.", battleId);
            return;
        }

        // 배틀룸의 총 참가자 수 업데이트
        battle.updateTotalUsers((int) remainingParticipants);

        // 6명 미만이면 상태를 WAITING으로 변경
        if (remainingParticipants < 6 && battle.getStatus() == Status.END) {
            battle.updateStatus(Status.WAITING);
            log.info("배틀룸 {} 인원이 6명 미만이 되어 상태가 WAITING으로 변경되었습니다.", battleId);
        }

        Battle savedBattle = battleRepository.save(battle);
        log.info("사용자 {} 가 배틀룸 {} 에서 퇴장했습니다. 최종 인원: {}",
                userId, battleId, savedBattle.getTotalUsers());
    }
}
