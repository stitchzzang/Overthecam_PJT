package com.overthecam.vote.service;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.exception.ErrorCode;
import com.overthecam.exception.GlobalException;
import com.overthecam.exception.vote.VoteErrorCode;
import com.overthecam.exception.vote.VoteException;
import com.overthecam.vote.domain.Vote;
import com.overthecam.vote.domain.VoteComment;
import com.overthecam.vote.dto.VoteCommentDto;
import com.overthecam.vote.repository.VoteCommentRepository;
import com.overthecam.vote.repository.VoteRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class VoteCommentService {
    private final VoteCommentRepository voteCommentRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;

    /**
     * 투표 댓글 작성
     * - 투표 및 사용자 존재 검증
     * - 댓글 생성 및 저장
     */
    public VoteCommentDto createComment(Long voteId, String content, Long userId) {
        Vote vote = findVoteById(voteId);
        User user = findUserById(userId);

        VoteComment comment = VoteComment.builder()
                .vote(vote)
                .user(user)
                .content(content)
                .build();

        return VoteCommentDto.from(voteCommentRepository.save(comment));
    }

    /**
     * 투표 댓글 수정
     * - 댓글 존재 확인
     * - 댓글 작성자 권한 검증
     * - 댓글 내용 업데이트
     */
    public VoteCommentDto updateComment(Long commentId, String content, Long userId) {
        VoteComment comment = findCommentById(commentId);
        validateCommentAuthor(comment, userId);

        comment.updateContent(content);
        return VoteCommentDto.from(comment);
    }

    /**
     * 투표 댓글 삭제
     * - 댓글 존재 확인
     * - 댓글 작성자 권한 검증
     * - 댓글 삭제
     */
    public void deleteComment(Long commentId, Long userId) {
        VoteComment comment = findCommentById(commentId);
        validateCommentAuthor(comment, userId);

        voteCommentRepository.delete(comment);
    }

    // 공통 유틸리티 메서드

    // 투표 ID로 투표 엔티티 조회
    private Vote findVoteById(Long voteId) {
        return voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.VOTE_NOT_FOUND, "투표를 찾을 수 없습니다"));
    }
    // 사용자 ID로 사용자 엔티티 조회
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다"));
    }
    //  댓글 ID로 댓글 엔티티 조회
    private VoteComment findCommentById(Long commentId) {
        return voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new VoteException(VoteErrorCode.COMMENT_NOT_FOUND, "댓글을 찾을 수 없습니다"));
    }
    /**
     * 댓글 작성자 권한 검증
     * - 요청 사용자와 댓글 작성자 ID 비교
     * - 일치하지 않는 경우 VoteException 발생
     */
    private void validateCommentAuthor(VoteComment comment, Long userId) {
        if (!comment.getUser().getUserId().equals(userId)) {
            throw new VoteException(VoteErrorCode.UNAUTHORIZED_COMMENT_ACCESS, "댓글 작업 권한이 없습니다");
        }
    }
}
