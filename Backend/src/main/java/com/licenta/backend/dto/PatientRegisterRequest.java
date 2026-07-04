package com.licenta.backend.dto;

import com.licenta.backend.model.BiologicalSex;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRegisterRequest {
    @NotBlank
    @Size(min = 2, max = 50)
    private String firstName;
    
    @NotBlank
    @Size(min = 2, max = 50)
    private String lastName;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 6, max = 100)
    private String password;
    
    @NotBlank
    @Size(min = 10, max = 15)
    private String phoneNumber;
    
    @NotNull
    private LocalDate dateOfBirth;
    
    @NotNull
    private BiologicalSex biologicalSex;
    
    @NotNull
    @Min(50)
    @Max(300)
    private Integer heightCm;
    
    @NotNull
    @DecimalMin("1.0")
    private Double weightKg;
    
    private String address;
    private String medicalHistory;
}
