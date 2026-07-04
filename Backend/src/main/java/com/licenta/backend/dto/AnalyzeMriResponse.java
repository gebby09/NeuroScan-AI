package com.licenta.backend.dto;

import com.licenta.backend.model.MriStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyzeMriResponse {
    private Long analysisId;
    private String prediction;
    private Double confidence;
    private Double probability;
    private MriStatus status;
    private String message;
}
