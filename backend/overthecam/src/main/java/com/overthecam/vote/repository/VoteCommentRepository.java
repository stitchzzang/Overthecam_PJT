package com.overthecam.vote.repository;

import com.overthecam.vote.domain.VoteComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

public interface VoteCommentRepository extends JpaRepository<VoteComment, Long> {
    List<VoteComment> findByVote_VoteIdOrderByCreatedAtDesc(Long voteId);
}