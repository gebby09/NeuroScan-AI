package com.licenta.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorSummaryResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String licenseNumber;
}
