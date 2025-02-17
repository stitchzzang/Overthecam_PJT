package com.overthecam.battlereport.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class ReportRealTimeRequest {
    private int userId;
    private String text;
}