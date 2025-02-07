//package com.overthecam.exception.battle;
//
//import com.overthecam.common.dto.CommonResponseDto;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//@Slf4j
//@RestControllerAdvice
//public class BattleExceptionHandler {
//    @ExceptionHandler(BattleException.class)
//    public ResponseEntity<CommonResponseDto<?>> handleBattleException(BattleException ex) {
//        log.error("Battle Exception occurred: {} - {}", ex.getErrorCode(), ex.getDetail());
//        return ResponseEntity
//                .badRequest()
//                .body(CommonResponseDto.builder()
//                        .code(ex.getErrorCode().getCode())
//                        .message(ex.getErrorCode().getMessage())
//                        .build());
//    }
//}