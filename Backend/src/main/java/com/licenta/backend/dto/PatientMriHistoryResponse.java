package com.licenta.backend.dto;

import com.licenta.backend.model.MriStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientMriHistoryResponse {
    private Long id;
    private String prediction;
    private Double confidence;
    private Double probability;
    private MriStatus status;
    private String doctorNotes;
    private String gradcamImage;
    private LocalDateTime createdAt;
    private String doctorName;
}
