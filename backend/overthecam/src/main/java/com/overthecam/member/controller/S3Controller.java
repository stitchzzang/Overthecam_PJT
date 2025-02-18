package com.overthecam.member.controller;


import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.member.service.S3Service;
import com.overthecam.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/mypage")
public class S3Controller {

    private final S3Service s3Service;
    private final SecurityUtils securityUtils;


    @PostMapping("/upload")
    public CommonResponseDto uploadFile(@RequestParam("file") MultipartFile file, Authentication authentication) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        s3Service.uploadFile(file, userId);
        return CommonResponseDto.ok();
    }


}
