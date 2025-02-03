package com.overthecam.vote.controller;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.security.service.UserDetailsImpl;
import com.overthecam.vote.dto.CommentRequestDto;
import com.overthecam.vote.dto.VoteCommentDto;
import com.overthecam.vote.dto.VoteRequestDto;
import com.overthecam.vote.dto.VoteResponseDto;
import com.overthecam.vote.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/votes")
public class VoteController {
    private final VoteService voteService;

    // 1. 투표 생성
    @PostMapping
    public ResponseEntity<CommonResponseDto<VoteResponseDto>> createVote(
            @Valid @RequestBody VoteRequestDto requestDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        VoteResponseDto responseDto = voteService.createVote(requestDto, userDetails.getUser().getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonResponseDto.success("투표가 생성되었습니다", responseDto));
    }

    // 2. 투표 목록 조회 (키워드 검색 및 정렬 지원)
    @GetMapping
    public ResponseEntity<CommonResponseDto<Page<VoteResponseDto>>> getVotes(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<VoteResponseDto> votes = voteService.getVotes(keyword, sortBy, pageable);
        return ResponseEntity.ok(CommonResponseDto.success(votes));
    }

    // 3. 특정 투표에 대한 투표 참여
    @PostMapping("/{voteId}/options/{optionId}")
    public ResponseEntity<CommonResponseDto<VoteResponseDto>> vote(
            @PathVariable Long voteId,
            @PathVariable Long optionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        VoteResponseDto responseDto = voteService.vote(voteId, optionId, userDetails.getUser().getUserId());
        return ResponseEntity.ok(CommonResponseDto.success("투표가 완료되었습니다", responseDto));
    }

    // 4. 특정 투표 상세 조회 (투표 옵션, 통계, 댓글 포함)
    @GetMapping("/{voteId}/detail")
    public ResponseEntity<CommonResponseDto<VoteResponseDto>> getVoteDetail(
            @PathVariable Long voteId
    ) {
        VoteResponseDto detailDto = voteService.getVoteDetail(voteId);
        return ResponseEntity.ok(CommonResponseDto.success(detailDto));
    }

    // 5. 댓글 작성
    @PostMapping("/{voteId}/comments")
    public ResponseEntity<CommonResponseDto<VoteCommentDto>> createComment(
            @PathVariable Long voteId,
            @Valid @RequestBody CommentRequestDto request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        VoteCommentDto responseDto = voteService.createComment(
                voteId,
                request.getContent(),
                userDetails.getUser().getUserId()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonResponseDto.success("댓글이 등록되었습니다", responseDto));
    }

    // 6. 댓글 수정
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommonResponseDto<VoteCommentDto>> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequestDto request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        VoteCommentDto responseDto = voteService.updateComment(
                commentId,
                request.getContent(),
                userDetails.getUser().getUserId()
        );
        return ResponseEntity.ok(CommonResponseDto.success("댓글이 수정되었습니다", responseDto));
    }

    // 7. 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<CommonResponseDto<Void>> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        voteService.deleteComment(commentId, userDetails.getUser().getUserId());
        return ResponseEntity.ok(CommonResponseDto.success("댓글이 삭제되었습니다", null));
    }
}