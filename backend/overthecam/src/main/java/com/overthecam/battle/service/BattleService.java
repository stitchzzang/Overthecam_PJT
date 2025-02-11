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

    public BattleRoomAllResponse getAllBattleRooms() {

        // status 0, 1인 배틀방만 최신순으로 조회
        List<Battle> battles = battleRepository.findByStatusInOrderByCreatedAtDesc(Arrays.asList(Status.WAITING, Status.PROGRESS));


        List<BattleInfo> battleInfos = battles.stream()
                .map(battle -> BattleInfo.builder()
                        .battleId(battle.getId())
                        .thumbnailUrl(battle.getThumbnailUrl())
                        .title(battle.getTitle())
                        .status(battle.getStatus().getCode())
                        .totalUsers(battle.getTotalUsers())
                        .build())
                .collect(Collectors.toList());

        return BattleRoomAllResponse.builder()
                .battleInfo(battleInfos)
                .build();

    }


}
