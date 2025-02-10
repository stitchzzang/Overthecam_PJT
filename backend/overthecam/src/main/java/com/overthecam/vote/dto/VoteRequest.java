package com.overthecam.vote.dto;
/**
* 투표 생성
    * 제목, 내용, 종료일, 옵션 입력
    * 유효성 검증 (제목 길이, 옵션 개수)
*/

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteRequest {

    @NotBlank(message = "제목은 필수입력입니다")
    @Size(min = 2, max = 100, message = "제목은 2~100자 사이여야 합니다")
    private String title;

    @Size(max = 500, message = "내용은 500자 이하여야 합니다")
    private String content;

    @Builder.Default
    private Long battleId = null;

    @NotEmpty(message = "2개의 옵션이 필요합니다")
    @Size(min = 2, max = 2, message = "2개의 옵션만 가능합니다")
    private List<String> options;
}