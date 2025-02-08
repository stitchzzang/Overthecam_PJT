package com.overthecam;

import com.overthecam.auth.exception.AuthErrorCode;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.exception.ErrorCode;
import com.overthecam.common.exception.GlobalException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String root() {
        return "root ok";
    }

    @RequestMapping("/test/cicd")
    public String test(){
        return "ci/cd test ok~~";
    }

    @GetMapping("/test/error")
    public ResponseEntity<CommonResponseDto<Object>> testUserNotFound() {
        throw new GlobalException(AuthErrorCode.USER_NOT_FOUND, "테스트용 사용자를 찾을 수 없습니다");
    }

    @GetMapping("/test/success")
    public ResponseEntity<CommonResponseDto<Object>> testSuccess() {
        return ResponseEntity.ok().body(CommonResponseDto.ok());
    }
}
