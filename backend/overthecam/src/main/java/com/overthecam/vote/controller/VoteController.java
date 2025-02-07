package com.overthecam.vote.controller;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.security.util.SecurityUtils;
import com.overthecam.vote.dto.CommentRequestDto;
import com.overthecam.vote.dto.VoteCommentDto;
import com.overthecam.vote.dto.VoteRequestDto;
import com.overthecam.vote.dto.VoteResponseDto;
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
                                           @Valid @RequestBody VoteRequestDto requestDto) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteResponseDto responseDto = voteService.createVote(requestDto, userId);
        return CommonResponseDto.success("투표가 생성되었습니다", responseDto);
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
        return CommonResponseDto.success(response);
    }

    // 3. 특정 투표 상세 조회
    @GetMapping("/{voteId}")
    public CommonResponseDto<VoteResponseDto> getVoteDetail(
            Authentication authentication,
            @PathVariable Long voteId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteResponseDto detailDto = voteService.getVoteDetail(voteId);
        return CommonResponseDto.success(detailDto);
    }

    // 4. 투표 참여
    @PostMapping("/{voteId}/vote/{optionId}")
    public CommonResponseDto<VoteResponseDto> vote(
            Authentication authentication,
            @PathVariable Long voteId,
            @PathVariable Long optionId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteResponseDto responseDto = voteService.vote(voteId, optionId, userId);
        return CommonResponseDto.success("투표가 완료되었습니다", responseDto);
    }

    // 5. 투표 삭제
    @DeleteMapping("/{voteId}")
    public CommonResponseDto<Void> deleteVote(
            Authentication authentication,
            @PathVariable Long voteId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        voteService.deleteVote(voteId, userId);
        return CommonResponseDto.success("투표가 삭제되었습니다", null);
    }

    // 6. 댓글 작성
    @PostMapping("/{voteId}/comment")
    public CommonResponseDto<VoteCommentDto> createComment(
            Authentication authentication,
            @PathVariable Long voteId,
            @Valid @RequestBody CommentRequestDto request
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteCommentDto responseDto = voteCommentService.createComment(voteId, request.getContent(), userId);
        return CommonResponseDto.success("댓글이 등록되었습니다", responseDto);
    }

    // 7. 댓글 수정
    @PutMapping("/comment/{commentId}")
    public CommonResponseDto<VoteCommentDto> updateComment(
            Authentication authentication,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequestDto request
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        VoteCommentDto responseDto = voteCommentService.updateComment(commentId, request.getContent(), userId);
        return CommonResponseDto.success("댓글이 수정되었습니다", responseDto);
    }

    // 8. 댓글 삭제
    @DeleteMapping("/comment/{commentId}")
    public CommonResponseDto<Void> deleteComment(
            Authentication authentication,
            @PathVariable Long commentId
    ) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        voteCommentService.deleteComment(commentId, userId);
        return CommonResponseDto.success("댓글이 삭제되었습니다", null);
    }
}