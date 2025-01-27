package com.overthecam.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * GlobalExceptionHandler는 애플리케이션 전역에서 발생하는 예외를 처리하는 클래스입니다.
 * @RestControllerAdvice 애노테이션을 사용하여 예외 처리 전용 컨트롤러로 지정합니다.
 * ResponseEntityExceptionHandler를 상속받아 기본적인 예외 처리 기능을 확장합니다.
 */

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {



}
