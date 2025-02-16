package com.overthecam.battlereport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 분석 요청을 위한 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextAnalysisRequest {
    private int userId;          // 사용자 식별자
    private String text;         // 분석할 텍스트
}