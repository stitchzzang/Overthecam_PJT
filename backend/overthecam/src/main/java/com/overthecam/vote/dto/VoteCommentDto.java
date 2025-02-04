package com.overthecam.vote.dto;

import com.overthecam.vote.domain.VoteComment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VoteCommentDto {
    // 댓글 정보 응답을 위한 DTO
    private Long commentId;
    private Long voteId;
    private String content;
    private String userNickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VoteCommentDto from(VoteComment entity) {
        return builder()
                .commentId(entity.getVoteCommentId())
                .voteId(entity.getVote().getVoteId())
                .content(entity.getContent())
                .userNickname(entity.getUser().getNickname())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}