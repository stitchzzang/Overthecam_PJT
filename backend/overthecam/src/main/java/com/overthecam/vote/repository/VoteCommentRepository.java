package com.overthecam.vote.repository;

import com.overthecam.vote.domain.VoteComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

public interface VoteCommentRepository extends JpaRepository<VoteComment, Long> {
    // 기존 메서드
    List<VoteComment> findByVote_VoteIdOrderByCreatedAtDesc(Long voteId);

    // 댓글 개수 조회
    long countByVote_VoteId(Long voteId);
}