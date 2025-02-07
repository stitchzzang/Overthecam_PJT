package com.overthecam.vote.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequestDto {
    // 댓글 내용 유효성 검증
    @NotBlank(message = "댓글 내용을 입력해주세요")
    @Size(max = 500, message = "댓글은 500자 이내로 작성해주세요")
    private String content;
}