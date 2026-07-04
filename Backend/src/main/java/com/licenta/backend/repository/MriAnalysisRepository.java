package com.licenta.backend.repository;

import com.licenta.backend.model.MriAnalysis;
import com.licenta.backend.model.MriStatus;
import com.licenta.backend.model.Patient;
import com.licenta.backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MriAnalysisRepository extends JpaRepository<MriAnalysis, Long> {
    List<MriAnalysis> findByPatient(Patient patient);
    
    List<MriAnalysis> findByDoctorAndStatus(Doctor doctor, MriStatus status);

    long countByPatient(Patient patient);

    List<MriAnalysis> findByDoctor(Doctor doctor);
}
