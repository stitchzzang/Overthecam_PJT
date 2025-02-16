package com.overthecam.battlereport.controller;

import com.overthecam.battlereport.dto.ReportRealTimeRequest;
import com.overthecam.battlereport.service.FlaskService;
import com.overthecam.common.dto.CommonResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class BattleReportController {

    private final FlaskService flaskService;

    /*
    한 문장씩 발화를 받는 메소드
     */
    @PostMapping("/text")
    public CommonResponseDto<ReportRealTimeRequest> getText(
            @RequestBody ReportRealTimeRequest request
    ) {

        log.info("Received text from user {}: {}", request.getUserId(), request.getText());

        // 1. Flask 서버로 텍스트 전송 및 분석 결과 수신
        flaskService.analyzeText(
                Integer.parseInt(request.getUserId())
        );


        return CommonResponseDto.ok();

    }

}
