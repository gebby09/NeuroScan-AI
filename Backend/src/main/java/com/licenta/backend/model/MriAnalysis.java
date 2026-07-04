package com.licenta.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mri_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MriAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonBackReference
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @JsonBackReference
    private Doctor doctor;

    private String imagePath;

    private String prediction;

    private Double confidence;

    @Column(columnDefinition = "TEXT")
    private String gradcamImage;

    private Double probability;

    @Column(columnDefinition = "TEXT")
    private String doctorNotes;

    @Enumerated(EnumType.STRING)
    private MriStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
