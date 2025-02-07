package com.overthecam.member.controller;

import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.member.dto.UserScoreInfo;
import com.overthecam.member.service.MyPageService;
import org.springframework.web.bind.annotation.RestController;

@RestController("/api/mypage")
public class MyPageController {

    public CommonResponseDto<UserScoreInfo> revertScoreToPoint(){
        UserScoreInfo response = MyPageService.revertScoreToPoint();
        return CommonResponseDto.success()
    }

}
