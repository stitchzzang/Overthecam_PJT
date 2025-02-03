package com.overthecam.vote.repository;

import com.overthecam.vote.domain.VoteOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VoteOptionRepository extends JpaRepository<VoteOption, Long> {
    List<VoteOption> findByVoteVoteId(Long voteId);

    @Query("SELECT vo.optionTitle, COUNT(vr) " +
            "FROM VoteOption vo " +
            "LEFT JOIN VoteRecord vr ON vo.voteOptionId = vr.voteOption.voteOptionId " +
            "WHERE vo.vote.voteId = :voteId " +
            "GROUP BY vo.optionTitle")
    List<Object[]> getVoteStatistics(@Param("voteId") Long voteId);
}
