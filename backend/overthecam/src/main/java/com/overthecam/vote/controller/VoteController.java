package com.overthecam.vote.controller;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.security.util.SecurityUtils;
import com.overthecam.vote.dto.CommentRequest;
import com.overthecam.vote.dto.VoteComment;
import com.overthecam.vote.dto.VoteDetailResponse;
import com.overthecam.vote.dto.VoteRequest;
import com.overthecam.vote.dto.VoteResponse;
import com.overthecam.vote.repository.VotePageResponse;
import com.overthecam.vote.service.VoteCommentService;
import com.overthecam.vote.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vote")
public class VoteController {
    private final VoteService voteService;
    private final VoteCommentService voteCommentService;
    private final SecurityUtils securityUtils;

    // 1. 투표 생성
    @PostMapping("/create")
    public CommonResponseDto<?> createVote(Authentication authentication,
                                           @Valid @RequestBody VoteRequest requestDto) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteResponse responseDto = voteService.createVote(requestDto, userId);
        return CommonResponseDto.ok(responseDto);
    }

    // 2. 투표 조회 및 검색
    @GetMapping("/list")
    public CommonResponseDto<VotePageResponse> getVotes(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VotePageResponse response = voteService.getVotes(keyword, sortBy, pageable);
        return CommonResponseDto.ok(response);
    }

    // 3. 특정 투표 상세 조회
    @GetMapping("/{voteId}")
    public CommonResponseDto<?> getVoteDetail(
            Authentication authentication,
            @PathVariable Long voteId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteDetailResponse detailDto = voteService.getVoteDetail(voteId);
        return CommonResponseDto.ok(detailDto);
    }

    // 4. 투표 참여
    @PostMapping("/{voteId}/vote/{optionId}")
    public CommonResponseDto<?> vote(
            Authentication authentication,
            @PathVariable Long voteId,
            @PathVariable Long optionId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteDetailResponse responseDto = voteService.vote(voteId, optionId, userId);
        return CommonResponseDto.ok(responseDto);
    }

    // 5. 투표 삭제
    @DeleteMapping("/{voteId}")
    public CommonResponseDto<Void> deleteVote(
            Authentication authentication,
            @PathVariable Long voteId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        voteService.deleteVote(voteId, userId);
        return CommonResponseDto.ok();
    }

    // 6. 댓글 작성
    @PostMapping("/{voteId}/comment")
    public CommonResponseDto<VoteComment> createComment(
            Authentication authentication,
            @PathVariable Long voteId,
            @Valid @RequestBody CommentRequest request
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteComment responseDto = voteCommentService.createComment(voteId, request.getContent(), userId);
        return CommonResponseDto.ok(responseDto);
    }

    // 7. 댓글 수정
    @PutMapping("/comment/{commentId}")
    public CommonResponseDto<VoteComment> updateComment(
            Authentication authentication,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteComment responseDto = voteCommentService.updateComment(commentId, request.getContent(), userId);
        return CommonResponseDto.ok(responseDto);
    }

    // 8. 댓글 삭제
    @DeleteMapping("/comment/{commentId}")
    public CommonResponseDto<Void> deleteComment(
            Authentication authentication,
            @PathVariable Long commentId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        voteCommentService.deleteComment(commentId, userId);
        return CommonResponseDto.ok();
    }
}