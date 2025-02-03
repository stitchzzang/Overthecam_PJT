package com.overthecam.vote.repository;

import com.overthecam.vote.domain.Vote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    Page<Vote> findByTitleContainingOrContentContaining(
            String titleKeyword,
            String contentKeyword,
            Pageable pageable
    );

    @Query("SELECT v FROM Vote v " +
            "LEFT JOIN v.options o " +
            "GROUP BY v " +
            "ORDER BY SUM(o.voteCount) DESC")
    Page<Vote> findAllOrderByVoteCountDesc(Pageable pageable);

    List<Vote> findAllByEndDateBeforeAndIsActiveTrue(LocalDateTime now);
}