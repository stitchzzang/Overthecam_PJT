package com.overthecam.vote.dto;
/**
* 투표 생성
    * 제목, 내용, 종료일, 옵션 입력
    * 유효성 검증 (제목 길이, 옵션 개수)
*/

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteRequestDto {

    @NotBlank(message = "제목은 필수입력입니다")
    @Size(min = 2, max = 100, message = "제목은 2~100자 사이여야 합니다")
    private String title;

    @Size(max = 500, message = "내용은 500자 이하여야 합니다")
    private String content;

    @Nullable
    private Long battleId;

    @NotNull(message = "종료일은 필수입니다")
    @Future(message = "종료일은 현재 이후의 날짜여야 합니다")
    private LocalDateTime endDate;

    @NotEmpty(message = "2개의 옵션이 필요합니다")
    @Size(min = 2, max = 2, message = "2개의 옵션만 가능합니다")
    private List<String> options;
}