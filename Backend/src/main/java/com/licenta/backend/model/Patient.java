package com.licenta.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient extends User {

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private BiologicalSex biologicalSex;

    private Integer heightCm;

    private Double weightKg;

    private String address;

    @Column(columnDefinition = "TEXT")
    private String medicalHistory;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @JsonBackReference
    private Doctor assignedDoctor;
}
