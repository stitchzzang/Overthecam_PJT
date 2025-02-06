package com.overthecam.websocket.service;

import com.overthecam.websocket.dto.UserScoreInfo;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.Status;
import com.overthecam.websocket.dto.*;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;

import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleDataService {

    private final UserRepository userRepository;
    private final BattleRepository battleRepository;
    private final BattleParticipantRepository battleParticipantRepository;

    public BattleData handleBattleStart(Long battleId) {
        Battle battle = battleRepository.findById(battleId)
            .orElseThrow(() -> new RuntimeException("Battle not found"));

        List<BattleParticipant> participants = battleParticipantRepository.findAllByBattleIdWithUser(battleId);

        // 1. 배틀 시작을 위한 초기 데이터 정보 생성
        BattleData battleStartInfo = BattleData.builder()
            .battleId(battleId)
            .sessionId(battle.getSessionId())
            .participants(participants.stream()
                .map(p -> new ParticipantInfo(
                    p.getUser().getUserId(),
                    p.getUser().getNickname(),
                    p.getUser().getProfileImage(),
                    p.getRole(),
                    p.getConnectionToken(),
                    p.getUser().getSupportScore(),
                    p.getUser().getPoint()
                ))
                .collect(Collectors.toList()))
            .build();

        // 2. 배틀 상태를 진행중으로 변경
        battle.updateStatus(Status.PROGRESS);
        battleRepository.save(battle);
        log.info("배틀 상태 업데이트 완료 - battleId: {}, 변경된 status: {}", battle.getId(), battle.getStatus());


        return battleStartInfo;
    }


    // redis로 상태 관리 후, 배틀이 종료되면 DB에 업데이트 로직 필요
    public UserScoreInfo handleCheerUpdate(Integer score, Long userId) {
        // log.debug("Handling cheer score update for battle: {}", message.getBattleId());

        // 응원점수 업데이트 로직
        UserScoreInfo data = UserScoreInfo.updateSupportScore(score);
        userRepository.updateSupportScore(userId, score);

        return data;
    }

    // redis로 상태 관리 후, 배틀이 종료되면 DB에 업데이트 로직 필요
    public UserScoreInfo handlePointUpdate(Integer point, Long userId) {
//        log.debug("Handling point update for battle: {}", message.getBattleId());

        // 포인트 업데이트 로직
        UserScoreInfo data = UserScoreInfo.updatePoints(point);
        userRepository.updatePoint(userId, point);

        return data;
    }
}
