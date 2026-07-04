package com.licenta.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorDashboardResponse {

    private long assignedPatients;
    private long pendingMri;
    private long reviewedAnalyses;
    private long thisMonth;
}