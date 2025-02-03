package com.overthecam.vote.dto;

import com.overthecam.vote.domain.VoteComment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VoteCommentDto {
    private Long commentId;
    private String content;
    private String userNickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VoteCommentDto from(VoteComment entity) {
        return VoteCommentDto.builder()
                .commentId(entity.getVoteCommentId())
                .content(entity.getContent())
                .userNickname(entity.getUser().getNickname())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}