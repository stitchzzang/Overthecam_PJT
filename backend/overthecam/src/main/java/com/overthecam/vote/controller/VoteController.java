package com.overthecam.vote.controller;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.exception.ErrorCode;
import com.overthecam.exception.GlobalException;
import com.overthecam.security.service.UserDetailsImpl;
import com.overthecam.security.util.SecurityUtils;
import com.overthecam.vote.dto.CommentRequestDto;
import com.overthecam.vote.dto.VoteCommentDto;
import com.overthecam.vote.dto.VoteRequestDto;
import com.overthecam.vote.dto.VoteResponseDto;
import com.overthecam.vote.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vote")
public class VoteController {
    private final VoteService voteService;
    private final SecurityUtils securityUtils;

    // 1. 투표 생성
    @PostMapping("/create")
    public CommonResponseDto<?> createVote(Authentication authentication,
                                           @Valid @RequestBody VoteRequestDto requestDto
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteResponseDto responseDto = voteService.createVote(requestDto, userId);
        return CommonResponseDto.success("투표가 생성되었습니다", responseDto);
    }

    // 2. 투표 목록 조회 (키워드 검색 및 정렬 지원)
    @GetMapping("/list")
    public ResponseEntity<CommonResponseDto<Page<VoteResponseDto>>> getVotes(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        Page<VoteResponseDto> votes = voteService.getVotes(keyword, sortBy, pageable);
        return ResponseEntity.ok(CommonResponseDto.success(votes));
    }

    // 3. 투표 검색
    @GetMapping("/search")
    public ResponseEntity<CommonResponseDto<Page<VoteResponseDto>>> searchVotes(
            Authentication authentication,
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        Page<VoteResponseDto> votes = voteService.searchVotes(keyword, pageable);
        return ResponseEntity.ok(CommonResponseDto.success(votes));
    }

    // 4. 특정 투표 상세 조회
    @GetMapping("/{voteId}/detail")
    public ResponseEntity<CommonResponseDto<VoteResponseDto>> getVoteDetail(
            Authentication authentication,
            @PathVariable Long voteId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteResponseDto detailDto = voteService.getVoteDetail(voteId);
        return ResponseEntity.ok(CommonResponseDto.success(detailDto));
    }

    // 5. 특정 투표에 대한 투표 참여
    @PostMapping("/{voteId}/vote/{optionId}")
    public ResponseEntity<CommonResponseDto<VoteResponseDto>> vote(
            Authentication authentication,
            @PathVariable Long voteId,
            @PathVariable Long optionId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteResponseDto responseDto = voteService.vote(voteId, optionId, userId);
        return ResponseEntity.ok(CommonResponseDto.success("투표가 완료되었습니다", responseDto));
    }

    // 6. 투표 삭제
    @DeleteMapping("/{voteId}")
    public ResponseEntity<CommonResponseDto<Void>> deleteVote(
            Authentication authentication,
            @PathVariable Long voteId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        voteService.deleteVote(voteId, userId);
        return ResponseEntity.ok(CommonResponseDto.success("투표가 삭제되었습니다", null));
    }

    // 7. 댓글 작성
    @PostMapping("/{voteId}/comment")
    public ResponseEntity<CommonResponseDto<VoteCommentDto>> createComment(
            Authentication authentication,
            @PathVariable Long voteId,
            @Valid @RequestBody CommentRequestDto request
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteCommentDto responseDto = voteService.createComment(voteId, request.getContent(), userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CommonResponseDto.success("댓글이 등록되었습니다", responseDto));
    }

    // 8. 댓글 수정
    @PutMapping("/comment/{commentId}")
    public ResponseEntity<CommonResponseDto<VoteCommentDto>> updateComment(
            Authentication authentication,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequestDto request
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteCommentDto responseDto = voteService.updateComment(commentId, request.getContent(), userId);
        return ResponseEntity.ok(CommonResponseDto.success("댓글이 수정되었습니다", responseDto));
    }

    // 9. 댓글 삭제
    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<CommonResponseDto<Void>> deleteComment(
            Authentication authentication,
            @PathVariable Long commentId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        voteService.deleteComment(commentId, userId);
        return ResponseEntity.ok(CommonResponseDto.success("댓글이 삭제되었습니다", null));
    }
}