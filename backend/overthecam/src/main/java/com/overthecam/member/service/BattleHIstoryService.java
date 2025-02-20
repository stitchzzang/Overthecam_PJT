package com.overthecam.member.service;

import com.overthecam.battle.domain.ParticipantRole;
import com.overthecam.battle.dto.BattleHostDto;
import com.overthecam.battle.dto.BattleResultDto;
import com.overthecam.battle.exception.BattleErrorCode;
import com.overthecam.battle.repository.BattleParticipantRepository;
import com.overthecam.battle.repository.BattleRepository;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.member.domain.BattleHistoryView;
import com.overthecam.member.dto.BattleCombinedStatusDto;
import com.overthecam.member.dto.BattleStatProjection;
import com.overthecam.member.dto.BattleStatsInfo;
import com.overthecam.member.repository.BattleHistoryPageResponse;
import com.overthecam.member.repository.BattleHistoryViewRepository;
import com.overthecam.vote.dto.VoteStatsProjection;
import com.overthecam.vote.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BattleHIstoryService {

    private final BattleHistoryViewRepository battleHistoryViewRepository;
    private final BattleRepository battleRepository;
    private final BattleParticipantRepository battleParticipantRepository;
    private final VoteRepository voteRepository;

    public BattleHistoryPageResponse findBattleHistoryViewByUserId(Long userId, Pageable pageable) {
        Page<BattleHistoryView> battles = battleHistoryViewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return BattleHistoryPageResponse.of(battles);
    }

    // 전적 통계를 위한 메서드 추가
    public BattleStatsInfo getBattleStats(Long userId) {
        List<BattleStatProjection> statsData = battleHistoryViewRepository.findBattleStatsDataByUserId(userId);

        long totalGames = statsData.size();
        long win = 0;
        long loss = 0;
        long draw = 0;

        for (BattleStatProjection stat : statsData) {
            boolean isBattler = stat.getRole() == ParticipantRole.BATTLER ||
                    stat.getRole() == ParticipantRole.HOST_BATTLER ||
                    stat.getRole() == ParticipantRole.PARTICIPANT_BATTLER;

            if (stat.isWinner()) {
                win++;
            } else {
                if (isBattler) {
                    if (stat.getEarnedScore() > 0) {
                        draw++;  // 배틀러 무승부
                    } else {
                        loss++;  // 배틀러 패배
                    }
                } else {
                    if (stat.getEarnedScore() == 0) {
                        draw++;  // 일반 참가자 무승부
                    } else {
                        loss++;  // 일반 참가자 패배
                    }
                }
            }
        }

        return new BattleStatsInfo(userId, totalGames, win, loss, draw);
    }

    public BattleCombinedStatusDto getBattleDetail(Long battleId, Long userId) {


        // 1. 배틀 기본 정보랑 호스트 정보 조회  (쿼리-1)
        BattleHostDto battleHost = battleRepository.findBattleWithHost(battleId)
                .orElseThrow(() -> new GlobalException(BattleErrorCode.BATTLE_NOT_FOUND, battleId + "번 배틀방이 존재하지 않습니다."));

        // 2. 참여자들의 닉네임 목록 조회 (쿼리-2)
        List<String> participantNicknames = battleParticipantRepository.findParticipantNicknamesByBattleId(battleId);

        // 3. 현재 유저의 배틀 결과 조회 (쿼리-3)
        BattleResultDto battleResult = battleHistoryViewRepository.findBattleResult(userId, battleId);

        List<VoteStatsProjection> voteResult = voteRepository.findVoteStatsByBattleId(battleId);


        // 4. 모든 정보를 합쳐서 하나의 DTO로 반환
        return BattleCombinedStatusDto.builder()
                .battleId(battleId)
                .title(battleHost.getTitle())
                .totalTime(battleHost.getTotalTime())
                .hostNickname(battleHost.getHostNickname())
                .participants(participantNicknames)
                .selectedOption(battleResult != null ? battleResult.getOptionTitle() : null)
                .isWinner(battleResult != null ? battleResult.isWinner() : false)
                .earnedScore(battleResult != null ? battleResult.getEarnedScore() : 0)
                .voteStats(voteResult)
                .createdAt(battleHost.getCreatedAt())
                .build();

    }
}
