package com.overthecam.battlereport.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ReportRealTimeRequest {
    private String userId;
    private String text;
}