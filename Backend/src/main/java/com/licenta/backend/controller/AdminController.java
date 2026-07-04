package com.licenta.backend.controller;

import com.licenta.backend.dto.AssignDoctorResponse;
import com.licenta.backend.dto.CreateDoctorRequest;
import com.licenta.backend.dto.DoctorResponse;
import com.licenta.backend.model.Doctor;
import com.licenta.backend.model.Notification;
import com.licenta.backend.model.Patient;
import com.licenta.backend.model.Role;
import com.licenta.backend.model.User;
import com.licenta.backend.repository.MriAnalysisRepository;
import com.licenta.backend.repository.NotificationRepository;
import com.licenta.backend.repository.SupportTicketRepository;
import com.licenta.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import com.licenta.backend.model.SupportTicketStatus;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final MriAnalysisRepository mriAnalysisRepository;
    private final SupportTicketRepository supportTicketRepository;

    @PostMapping("/doctors")
    public ResponseEntity<DoctorResponse> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            DoctorResponse errorResponse = DoctorResponse.builder()
                    .message("Email already exists")
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        Doctor doctor = new Doctor();
        
        // Set common user fields
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setEmail(request.getEmail());
        doctor.setPassword(passwordEncoder.encode(request.getPassword()));
        doctor.setPhoneNumber(request.getPhoneNumber());
        doctor.setRole(Role.DOCTOR);
        
        // Set doctor-specific fields
        doctor.setLicenseNumber(request.getLicenseNumber());
        
        Doctor savedDoctor = userRepository.save(doctor);
        
        DoctorResponse response = DoctorResponse.builder()
                .id(savedDoctor.getId())
                .firstName(savedDoctor.getFirstName())
                .lastName(savedDoctor.getLastName())
                .email(savedDoctor.getEmail())
                .role(savedDoctor.getRole().toString())
                .licenseNumber(savedDoctor.getLicenseNumber())
                .message("Doctor created successfully")
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/dashboard")
public ResponseEntity<Map<String, Object>> getDashboard() {

    List<User> users = userRepository.findAll();

    long totalDoctors = users.stream()
            .filter(u -> u instanceof Doctor)
            .count();

    long totalPatients = users.stream()
            .filter(u -> u instanceof Patient)
            .count();

    long totalAnalyses = mriAnalysisRepository.count();

    Map<String, Object> dashboard = new HashMap<>();
    dashboard.put("totalDoctors", totalDoctors);
    dashboard.put("totalPatients", totalPatients);
    dashboard.put("totalAnalyses", totalAnalyses);

    // momentan nu ai sistem real de ticket status
   dashboard.put(
    "openTickets",
    supportTicketRepository.countByStatus(SupportTicketStatus.OPEN)
);


    return ResponseEntity.ok(dashboard);
}


@GetMapping("/activities")
public ResponseEntity<List<Map<String, Object>>> getRecentActivities() {

    List<Map<String, Object>> activities = new ArrayList<>();

    List<User> users = userRepository.findAll();

    users.stream()
            .filter(u -> u instanceof Patient)
            .map(u -> (Patient) u)
            .forEach(patient -> {

                Map<String, Object> activity = new HashMap<>();

                activity.put(
                        "title",
                        "Patient registered: "
                                + patient.getFirstName()
                                + " "
                                + patient.getLastName()
                );

                activity.put("type", "patient");
                activity.put("createdAt", patient.getCreatedAt());

                activities.add(activity);
            });

    users.stream()
            .filter(u -> u instanceof Doctor)
            .map(u -> (Doctor) u)
            .forEach(doctor -> {

                Map<String, Object> activity = new HashMap<>();

                activity.put(
                        "title",
                        "Doctor registered: Dr. "
                                + doctor.getFirstName()
                                + " "
                                + doctor.getLastName()
                );

                activity.put("type", "doctor");
                activity.put("createdAt", doctor.getCreatedAt());

                activities.add(activity);
            });

    activities.sort((a, b) ->
            ((java.time.LocalDateTime) b.get("createdAt"))
                    .compareTo((java.time.LocalDateTime) a.get("createdAt"))
    );

    return ResponseEntity.ok(activities);
}

    @GetMapping("/assignments")
public ResponseEntity<List<Map<String, Object>>> getRecentAssignments() {

    List<User> users = userRepository.findAll();

    List<Map<String, Object>> assignments = users.stream()
            .filter(user -> user instanceof Patient)
            .map(user -> (Patient) user)
            .filter(patient -> patient.getAssignedDoctor() != null)
            .map(patient -> {
                Map<String, Object> assignment = new HashMap<>();

                assignment.put(
                        "patientName",
                        patient.getFirstName() + " " + patient.getLastName()
                );

                assignment.put(
                        "doctorName",
                        "Dr. " +
                        patient.getAssignedDoctor().getFirstName() +
                        " " +
                        patient.getAssignedDoctor().getLastName()
                );

                assignment.put(
                        "assignedAt",
                        patient.getCreatedAt()
                );

                return assignment;
            })
            .toList();

    return ResponseEntity.ok(assignments);
}

    @PutMapping("/doctors/{id}")
public ResponseEntity<DoctorResponse> updateDoctor(
        @PathVariable Long id,
        @RequestBody CreateDoctorRequest request) {

    User user = userRepository.findById(id).orElse(null);

    if (user == null || !(user instanceof Doctor)) {
        return ResponseEntity.notFound().build();
    }

    Doctor doctor = (Doctor) user;

    doctor.setFirstName(request.getFirstName());
    doctor.setLastName(request.getLastName());
    doctor.setEmail(request.getEmail());
    doctor.setPhoneNumber(request.getPhoneNumber());
    doctor.setLicenseNumber(request.getLicenseNumber());

    if (request.getPassword() != null && !request.getPassword().isBlank()) {
        doctor.setPassword(passwordEncoder.encode(request.getPassword()));
    }

    Doctor savedDoctor = userRepository.save(doctor);

    Notification doctorWelcomeNotification = new Notification();
doctorWelcomeNotification.setUser(savedDoctor);
doctorWelcomeNotification.setTitle("Doctor account created");
doctorWelcomeNotification.setMessage(
        "Your NeuroScan AI doctor account has been created."
);
doctorWelcomeNotification.setIsRead(false);
notificationRepository.save(doctorWelcomeNotification);

    return ResponseEntity.ok(
            DoctorResponse.builder()
                    .id(savedDoctor.getId())
                    .firstName(savedDoctor.getFirstName())
                    .lastName(savedDoctor.getLastName())
                    .email(savedDoctor.getEmail())
                    .licenseNumber(savedDoctor.getLicenseNumber())
                    .message("Doctor updated successfully")
                    .build()
    );
}

    @GetMapping("/doctors")
public ResponseEntity<List<DoctorResponse>> getAllDoctors() {

    List<User> users = userRepository.findAll();

    List<DoctorResponse> doctors = users.stream()
            .filter(user -> user instanceof Doctor)
            .map(user -> {
                Doctor doctor = (Doctor) user;

               long patientCount = users.stream()
        .filter(u -> u instanceof Patient)
        .map(u -> (Patient) u)
        .filter(p -> p.getAssignedDoctor() != null)
        .filter(p -> p.getAssignedDoctor().getId().equals(doctor.getId()))
        .count();

return DoctorResponse.builder()
        .id(doctor.getId())
        .firstName(doctor.getFirstName())
        .lastName(doctor.getLastName())
        .email(doctor.getEmail())
        .licenseNumber(doctor.getLicenseNumber())
        .patientCount((int) patientCount)
        .createdAt(doctor.getCreatedAt())
        .build();
            })
            .toList();

    return ResponseEntity.ok(doctors);
}

@GetMapping("/patients")
public ResponseEntity<List<Map<String, Object>>> getAllPatients() {

    List<User> users = userRepository.findAll();

    List<Map<String, Object>> patients = users.stream()
            .filter(user -> user instanceof Patient)
            .map(user -> {
                Patient patient = (Patient) user;

                Map<String, Object> patientData = new HashMap<>();
                patientData.put("id", patient.getId());
                patientData.put("firstName", patient.getFirstName());
                patientData.put("lastName", patient.getLastName());
                patientData.put("email", patient.getEmail());

                patientData.put("createdAt", patient.getCreatedAt());

patientData.put(
    "mriCount",
    mriAnalysisRepository.countByPatient(patient)
);


                if (patient.getAssignedDoctor() != null) {

                       patientData.put(
        "assignedDoctorId",
        patient.getAssignedDoctor().getId()
    );
    
                    patientData.put(
                            "assignedDoctor",
                            "Dr. " +
                            patient.getAssignedDoctor().getFirstName() +
                            " " +
                            patient.getAssignedDoctor().getLastName()
                    );

                    patientData.put(
                         "assignedDoctorName",
                         patient.getAssignedDoctor().getFirstName()
                                 + " "
                                   + patient.getAssignedDoctor().getLastName()
);
                }

                return patientData;
            })
            .toList();

    return ResponseEntity.ok(patients);
}

    @PutMapping("/patients/{patientId}/assign-doctor/{doctorId}")
    public ResponseEntity<AssignDoctorResponse> assignDoctorToPatient(
            @PathVariable Long patientId,
            @PathVariable Long doctorId) {
        
        // Find patient
        User patientUser = userRepository.findById(patientId).orElse(null);
        if (patientUser == null || !(patientUser instanceof Patient)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Patient patient = (Patient) patientUser;
        
        // Find doctor
        User doctorUser = userRepository.findById(doctorId).orElse(null);
        if (doctorUser == null || !(doctorUser instanceof Doctor)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Doctor doctor = (Doctor) doctorUser;
        
        // Assign doctor to patient
        patient.setAssignedDoctor(doctor);
        userRepository.save(patient);
        
        // Create notification for patient
        // Notification for patient
Notification patientNotification = new Notification();
patientNotification.setUser(patient);
patientNotification.setTitle("Doctor Assigned");
patientNotification.setMessage(
        "You have been assigned to Dr. "
                + doctor.getFirstName()
                + " "
                + doctor.getLastName()
);
patientNotification.setIsRead(false);
notificationRepository.save(patientNotification);

// Notification for doctor
Notification doctorNotification = new Notification();
doctorNotification.setUser(doctor);
doctorNotification.setTitle("New Patient Assigned");
doctorNotification.setMessage(
        "Patient "
                + patient.getFirstName()
                + " "
                + patient.getLastName()
                + " has been assigned to you."
);
doctorNotification.setIsRead(false);
notificationRepository.save(doctorNotification);
        
        AssignDoctorResponse response = AssignDoctorResponse.builder()
                .message("Doctor assigned to patient successfully")
                .patientId(patient.getId())
                .doctorId(doctor.getId())
                .build();
        
        return ResponseEntity.ok(response);
    }
}
