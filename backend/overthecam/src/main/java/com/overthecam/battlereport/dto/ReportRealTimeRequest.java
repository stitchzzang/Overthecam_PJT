package com.overthecam.battlereport.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ReportRealTimeRequest {
    String userId;
    String text;
}
