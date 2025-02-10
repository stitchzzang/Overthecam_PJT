package com.overthecam.vote.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteComment {

    // 댓글 정보 응답을 위한 DTO
    private Long commentId;
    private Long voteId;
    private String content;
    private Long userId;
    private String userNickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VoteComment from(com.overthecam.vote.domain.VoteComment entity) {
        return builder()
                .commentId(entity.getVoteCommentId())
                .voteId(entity.getVote().getVoteId())
                .content(entity.getContent())
                .userId(entity.getUser().getId())
                .userNickname(entity.getUser().getNickname())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}