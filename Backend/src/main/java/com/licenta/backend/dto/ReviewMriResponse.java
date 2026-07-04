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
public class ReviewMriResponse {
    private Long analysisId;
    private MriStatus status;
    private String message;
}
