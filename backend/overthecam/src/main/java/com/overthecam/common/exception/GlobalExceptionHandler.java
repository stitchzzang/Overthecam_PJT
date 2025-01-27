package com.overthecam.common.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

public class GlobalExceptionHandler<T> {

    @ExceptionHandler(value = GlobalException.class)
    public ResponseEntity<Map<String, Object>> ExceptionHandler(GlobalException e) {
        HttpHeaders responseHttpHeaders = new HttpHeaders();

        Map<String, Object> map = new HashMap<>();
        map.put("error type", e.getHttpStatusType());
        map.put("error code", e.getHttpStatusCode());
        map.put("message", e.getMessage());

        return new ResponseEntity<>(map, responseHttpHeaders, e.getHttpStatus());

    }

}
