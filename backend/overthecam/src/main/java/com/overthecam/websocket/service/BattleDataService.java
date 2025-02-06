package com.overthecam.websocket.service;

import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.repository.VoteRepository;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.battle.domain.Battle;
import com.overthecam.battle.domain.BattleParticipant;
import com.overthecam.battle.domain.Status;
import com.overthecam.websocket.dto.*;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleDataService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final BattleRepository battleRepository;
    private final BattleParticipantRepository battleParticipantRepository;

    public BattleData handleBattleStart(Long battleId) {
        Battle battle = battleRepository.findById(battleId)
            .orElseThrow(() -> new RuntimeException("Battle not found"));

        List<BattleParticipant> participants = battleParticipantRepository.findAllByBattleIdWithUser(battleId);
        Vote vote = voteRepository.findByBattleId(battleId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

        // 투표 옵션 정보 변환
        List<VoteInfo.VoteOptionInfo> voteOptions = vote.getOptions().stream()
            .map(option -> VoteInfo.VoteOptionInfo.builder()
                .optionId(option.getVoteOptionId())
                .optionTitle(option.getOptionTitle())
                .build())
            .collect(Collectors.toList());

        // 투표 정보 생성
        VoteInfo voteInfo = VoteInfo.builder()
            .voteId(vote.getVoteId())
            .title(vote.getTitle())
            .options(voteOptions)
            .build();

        // 배틀 시작 데이터 생성
        BattleData battleStartInfo = BattleData.builder()
            .battleId(battleId)
            .sessionId(battle.getSessionId())
            .voteInfo(voteInfo)
            .participants(participants.stream()
                .map(p -> new ParticipantInfo(
                    p.getUser().getUserId(),
                    p.getUser().getNickname(),
                    p.getUser().getProfileImage(),
                    p.getRole(),
                    p.getConnectionToken()
                ))
                .collect(Collectors.toList()))
            .build();

        // 배틀 상태 업데이트
        battle.updateStatus(Status.PROGRESS);
        battleRepository.save(battle);
        log.info("배틀 상태 업데이트 완료 - battleId: {}, 변경된 status: {}", battle.getId(), battle.getStatus());

        return battleStartInfo;
    }

    public ChatMessageResponse getBattlerParticipants(Long battleId) {
        List<BattleParticipant> participants = battleParticipantRepository.findAllByBattleIdWithUser(battleId);

        List<String> battlerNames = participants.stream()
            .filter(p -> ParticipantRole.isBattler(p.getRole()))
            .map(p -> p.getUser().getNickname())
            .toList();

        String content = String.format("%s님과 %s님 배틀러 선정!\n건강하고 유쾌한 논쟁 되시길 바랍니다!",
            battlerNames.get(0), battlerNames.get(1));

        return ChatMessageResponse.builder()
            .nickname("System")
            .content(content)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public UserScoreInfo getUserScoreInfo(Long userId){
        return userRepository.findUserScores(userId);
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
