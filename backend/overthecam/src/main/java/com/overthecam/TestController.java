package com.overthecam;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.exception.ErrorCode;
import com.overthecam.exception.GlobalException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.Mapping;
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
        throw new GlobalException(ErrorCode.USER_NOT_FOUND, "테스트용 사용자를 찾을 수 없습니다");
    }

    @GetMapping("/test/success")
    public ResponseEntity<CommonResponseDto<Object>> testSuccess() {
        // return ResponseEntity.ok().body(CommonResponseDto.success("hihi"));
        return ResponseEntity.ok().body(CommonResponseDto.success("응답 성공 테스트가 완료되었습니다.", "hihi"));
    }
}
