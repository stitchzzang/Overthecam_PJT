package com.overthecam.battle.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.domain.Status;
import com.overthecam.battle.dto.*;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
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

    private final OpenViduService openViduService;
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
     * 배틀 방을 생성하고 방장을 등록하는 메서드
     */
    public BattleResponse createBattleRoom(BattleCreateRequest request, Long userId) throws OpenViduJavaClientException, OpenViduHttpException {

        // 1. 사용자 조회
        User user = getUserById(userId);

        System.out.println("사용자 조회 완료 후 방 생성 대기중 !");

        // 2. OpenVidu 세션 생성
        String sessionId = openViduService.createSession();

        System.out.println("세션 생성 완료!");

        // 3. 배틀방 생성
        Battle battle = Battle.builder()
                .title(request.getTitle())
                .sessionId(sessionId)
                .roomUrl("https://1dan2gulro.hapsida~~")
                .thumbnailUrl("https://d26tym50939cjl.cloudfront.net/thumbnails/thumbnail+4.png")
                .build();

        Battle savedBattle = battleRepository.save(battle);

        // 4. OpenVidu 토큰 생성
        String connectionToken = openViduService.createPublisherConnection(sessionId);

        // 5. 방장 등록
        BattleParticipant host = BattleParticipant.builder()
                .battle(savedBattle)
                .user(user)  // 최소한의 User 객체
                .role(ParticipantRole.HOST)   // 방장 역할만 부여
                .connectionToken(connectionToken)
                .build();

        battleParticipantRepository.save(host);


        return BattleResponse.builder()
                .battleId(savedBattle.getId()) //배틀방 번호
                .title(savedBattle.getTitle()) //방제
                .sessionId(sessionId) //세션 ID
                .connectionToken(connectionToken) //사용자별 고유한 TOKEN
                .roomUrl(savedBattle.getRoomUrl()) //방 초대 url
                .build();
    } //여기까지가 처음에 방이 생성되고 방장의 role만 설정된 상태


    /**
     * 배틀방 참가 메서드
     */
    public BattleResponse joinBattle(Long battleId, Long userId) throws OpenViduJavaClientException, OpenViduHttpException {

        User user = getUserById(userId);
        Battle battle = getBattleById(battleId);

        if (battle.getStatus() == Status.PROGRESS) {
            throw new RuntimeException("이미 시작된 배틀입니다.");
        }

        if (battle.getTotalUsers() >= 5) {
            throw new RuntimeException("방이 가득 찼습니다.");
        }

        // 4. OpenVidu 토큰 생성 (비디오/오디오 OFF 상태)
        String connectionToken = openViduService.createPublisherConnection(battle.getSessionId());

        // 5. 참가자 등록
        BattleParticipant participant = BattleParticipant.builder()
                .battle(battle)
                .user(user)
                .role(ParticipantRole.PARTICIPANT)
                .connectionToken(connectionToken)
                .build();
        battleParticipantRepository.save(participant);

        //5. 참가자수 증가
        battle.updateTotalUsers(battle.getTotalUsers() + 1);
        battleRepository.save(battle);

        return BattleResponse.builder()
                .battleId(battle.getId())
                .title(battle.getTitle())
                .sessionId(battle.getSessionId())
                .connectionToken(connectionToken)
                .roomUrl(battle.getRoomUrl())
                .build();

    } //여기까지가 배틀방이 생성된 후에 6명의 참가자가 모이는 상태

    private User getUserById(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * 배틀러 선정 및 배틀 시작 메서드
     */
    public SelectBattlerResponse selectBattlers(Long battleId, String battler1, String battler2) throws OpenViduJavaClientException, OpenViduHttpException {
        Battle battle = getBattleById(battleId);

        // 2. 현재 방의 모든 참가자 조회
        List<BattleParticipant> participants = battleParticipantRepository.findAllByBattleIdWithUser(battleId);

        //3. role update
        int updatedCount = 0;
        for (BattleParticipant participant : participants) {
            if (participant.getUser().getNickname().equals(battler1) ||
                    participant.getUser().getNickname().equals(battler2)) {
                participant.updateRole(participant.getRole() | ParticipantRole.BATTLER);
                battleParticipantRepository.save(participant);
                updatedCount++;
            }
        }
        log.info("배틀러 역할 업데이트 완료 | 변경된 참가자 수: {}", updatedCount);

        return new SelectBattlerResponse(battleId, battle.getSessionId());

    }//여기까지가 배틀방이 생성된 후에 6명의 참가자가 모여서 배틀러 정하고 방 생성까지 완료한 상태

    public RandomVoteTopicResponse createRandomVoteTopic() {
        int randomIdx = (int) (Math.random() * topics.length);

        return RandomVoteTopicResponse.builder()
                .title(topics[randomIdx])
                .build();
    }

    public BattleResponse updateTitle(Long battleId, String newTitle) {
        // 1. 배틀방 조회
        Battle battle = getBattleById(battleId);

        // 2. 진행중인 배틀인지 확인
        if (battle.getStatus() == Status.PROGRESS) {
            throw new RuntimeException("진행 중인 배틀은 방제를 변경할 수 없습니다");
        }

        // 3. 방제 변경
        battle.updateTitle(newTitle);
        battleRepository.save(battle);

        // 4. 변경된 정보 반환
        return BattleResponse.builder()
                .battleId(battle.getId())
                .title(battle.getTitle())
                .sessionId(battle.getSessionId())
                .roomUrl(battle.getRoomUrl())
                .build();
    }

    /**
     * OpenVidu 세션이 만료된 경우 배틀방 자동 삭제
     */
    public void checkAndDeleteBattle(Long battleId) {
        Battle battle = getBattleById(battleId);

        // OpenVidu 세션이 종료된 경우만 삭제
        if (openViduService.isSessionClosed(battle.getSessionId())) {
            log.info("✅ OpenVidu 세션이 만료됨 | 배틀방 삭제 진행 | battleId: {}", battleId);

            // 참가자 정보 삭제
            battleParticipantRepository.deleteAllByBattleId(battleId);

            // 배틀방 삭제
            battleRepository.delete(battle);
        }
    }

    private Battle getBattleById(Long battleId) {
        return battleRepository.findById(battleId).orElseThrow(() -> new RuntimeException("배틀방을 찾을 수 없습니다."));
    }

    public BattleRoomAllResponse getAllBattleRooms() {

        // status 0, 1인 배틀방만 조회
        List<Battle> battles = battleRepository.findByStatusIn(Arrays.asList(Status.WAITING, Status.PROGRESS));


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
