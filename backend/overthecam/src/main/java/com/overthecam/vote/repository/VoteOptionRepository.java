package com.overthecam.vote.repository;

import com.overthecam.vote.domain.VoteOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VoteOptionRepository extends JpaRepository<VoteOption, Long> {

    void deleteByVote_VoteId(Long voteId);

    @Query("SELECT COUNT(vr) FROM VoteRecord vr WHERE vr.voteOption.voteOptionId = :optionId")
    Long getVoteCount(@Param("optionId") Long optionId);

    // 투표 전체 count (투표 참여자 수 계산용)
    @Query("SELECT COUNT(vr) FROM VoteRecord vr WHERE vr.vote.voteId = :voteId")
    Long getTotalVoteCount(@Param("voteId") Long voteId);

    // 투표 수 증가를 위한 메서드
    @Modifying
    @Query("UPDATE VoteOption o SET o.voteCount = o.voteCount + 1 WHERE o.voteOptionId = :optionId")
    void incrementVoteCount(@Param("optionId") Long optionId);

    // 실시간 데이터 조회를 위한 메서드
    @Query("SELECT o FROM VoteOption o WHERE o.voteOptionId = :optionId")
    VoteOption findByIdWithFreshData(@Param("optionId") Long optionId);


}
