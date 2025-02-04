package com.overthecam.exception.vote;

import com.overthecam.common.dto.CommonResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class VoteExceptionHandler {
    @ExceptionHandler(VoteException.class)
    public ResponseEntity<CommonResponseDto<?>> handleVoteException(VoteException ex) {
        log.error("Vote 통신 오류: {} - {}", ex.getErrorCode().getCode(), ex.getDetail());

        return ResponseEntity
                .badRequest()
                .body(CommonResponseDto.builder()
                        .code(400)
                        .message(ex.getErrorCode().getMessage())
                        .build());
    }
}