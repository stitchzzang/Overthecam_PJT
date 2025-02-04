package com.overthecam.exception.vote;

import com.overthecam.common.dto.CommonResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class VoteExceptionHandler {
    @ExceptionHandler(VoteException.class)
    public ResponseEntity<CommonResponseDto<?>> handleVoteException(VoteException e) {
        // 로그 기록
        log.error("Vote Exception occurred: {}", e.getMessage());

        // 특정 에러 코드와 메시지 반환
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(CommonResponseDto.<Object>builder()
                        .code(400)
                        .message(e.getErrorCode().getMessage())
                        .build());
    }
}