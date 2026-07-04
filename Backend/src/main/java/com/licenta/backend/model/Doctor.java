package com.licenta.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor extends User {

    private String licenseNumber;

    @OneToMany(mappedBy = "assignedDoctor")
    @JsonManagedReference
    private List<Patient> patients;
}