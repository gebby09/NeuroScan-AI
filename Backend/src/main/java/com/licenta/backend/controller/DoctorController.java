package com.licenta.backend.controller;

import com.licenta.backend.dto.AnalyzeMriResponse;
import com.licenta.backend.dto.DoctorDashboardResponse;
import com.licenta.backend.dto.MriSummaryResponse;
import com.licenta.backend.dto.PatientSummaryResponse;
import com.licenta.backend.dto.ReviewMriRequest;
import com.licenta.backend.dto.ReviewMriResponse;
import com.licenta.backend.model.Doctor;
import com.licenta.backend.model.MriAnalysis;
import com.licenta.backend.model.MriStatus;
import com.licenta.backend.model.Notification;
import com.licenta.backend.model.Patient;
import com.licenta.backend.model.User;
import com.licenta.backend.repository.MriAnalysisRepository;
import com.licenta.backend.repository.NotificationRepository;
import com.licenta.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final UserRepository userRepository;
    private final MriAnalysisRepository mriAnalysisRepository;
    private final NotificationRepository notificationRepository;
    private final RestTemplate restTemplate;

    @GetMapping("/patients")
    public ResponseEntity<List<PatientSummaryResponse>> getMyPatients(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null || !(user instanceof Doctor)) {
            return ResponseEntity.notFound().build();
        }
        
        Doctor doctor = (Doctor) user;
        List<PatientSummaryResponse> patientResponses = new ArrayList<>();
        
        if (doctor.getPatients() != null) {
            for (Patient patient : doctor.getPatients()) {
                PatientSummaryResponse response = PatientSummaryResponse.builder()
                        .id(patient.getId())
                        .firstName(patient.getFirstName())
                        .lastName(patient.getLastName())
                        .email(patient.getEmail())
                        .build();
                patientResponses.add(response);
            }
        }
        
        return ResponseEntity.ok(patientResponses);
    }

    @GetMapping("/mri/{id}")
public ResponseEntity<?> getMriDetails(
        @PathVariable Long id,
        Authentication authentication) {

    String email = authentication.getName();
    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null || !(user instanceof Doctor)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Doctor doctor = (Doctor) user;

    MriAnalysis analysis = mriAnalysisRepository.findById(id).orElse(null);

    if (analysis == null) {
        return ResponseEntity.notFound().build();
    }

    Patient patient = analysis.getPatient();

    if (!canAccessAnalysis(analysis, doctor)) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Map<String, Object> response = new LinkedHashMap<>();

    response.put("id", analysis.getId());
    response.put("prediction", analysis.getPrediction());
    response.put("confidence", analysis.getConfidence());
    response.put("probability", analysis.getProbability());
    response.put("status", analysis.getStatus());
    response.put("doctorNotes", analysis.getDoctorNotes());
    response.put("createdAt", analysis.getCreatedAt());

    if (patient != null) {
        response.put(
                "patientName",
                patient.getFirstName() + " " + patient.getLastName()
        );
        response.put(
        "patientEmail",
        patient.getEmail()
);
    }

    if (analysis.getImagePath() != null) {
        response.put(
                "imageUrl",
                "http://localhost:8080/" +
                analysis.getImagePath().replace("\\", "/")
        );
    }

    response.put("gradcamImage", analysis.getGradcamImage());

    return ResponseEntity.ok(response);
}

    @GetMapping("/mri/pending")
    public ResponseEntity<List<MriSummaryResponse>> getPendingMriAnalyses(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null || !(user instanceof Doctor)) {
            return ResponseEntity.notFound().build();
        }
        
        Doctor doctor = (Doctor) user;
        List<MriAnalysis> analyses = mriAnalysisRepository.findByDoctorAndStatus(doctor, MriStatus.PENDING);
        List<MriSummaryResponse> responses = new ArrayList<>();
        
        for (MriAnalysis analysis : analyses) {
            String patientName = "";

            if (analysis.getPatient() != null) {
                patientName =
                        analysis.getPatient().getFirstName()
                                + " "
                                + analysis.getPatient().getLastName();
            }

            MriSummaryResponse response = MriSummaryResponse.builder()
                    .id(analysis.getId())
                    .prediction(analysis.getPrediction())
                    .confidence(analysis.getConfidence())
                    .status(analysis.getStatus())
                    .createdAt(analysis.getCreatedAt())
                    .patientName(patientName)
                    .build();
            responses.add(response);
        }
        
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/mri/{id}/analyze")
    public ResponseEntity<?> analyzeMri(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        // Verify user is a doctor
        if (user == null || !(user instanceof Doctor)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ReviewMriResponse(null, null, "Authenticated user is not a doctor"));
        }
        
        Doctor doctor = (Doctor) user;
        
        // Find MRI analysis by id
        MriAnalysis analysis = mriAnalysisRepository.findById(id).orElse(null);
        if (analysis == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AnalyzeMriResponse(null, null, null, null, null, "MRI analysis not found"));
        }
        
        // Verify MRI belongs to a patient assigned to the current doctor
        Patient patient = analysis.getPatient();
        if (!canAccessAnalysis(analysis, doctor)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AnalyzeMriResponse(null, null, null, null, null, "This MRI does not belong to your patient"));
        }

        syncAnalysisDoctorIfNeeded(analysis, doctor);
        
        // Verify status is PENDING before analysis
        if (!analysis.getStatus().equals(MriStatus.PENDING)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AnalyzeMriResponse(null, null, null, null, analysis.getStatus(), "MRI is already analyzed or reviewed"));
        }
        
        try {
            // Read MRI image file from local disk
            String imagePath = analysis.getImagePath();
            File imageFile = new File(imagePath);
            
            if (!imageFile.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new AnalyzeMriResponse(analysis.getId(), null, null, null, analysis.getStatus(), "Image file not found on disk"));
            }
            
            // Prepare multipart request for FastAPI
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(imageFile));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // Send to FastAPI endpoint
            String fastApiUrl = "http://localhost:8000/predict";
            ResponseEntity<Map> fastApiResponse = restTemplate.postForEntity(fastApiUrl, requestEntity, Map.class);
            
            if (!fastApiResponse.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AnalyzeMriResponse(analysis.getId(), null, null, null, analysis.getStatus(), "FastAPI server returned error"));
            }
            
            // Parse FastAPI response
            Map<String, Object> responseData = fastApiResponse.getBody();
            if (responseData == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AnalyzeMriResponse(analysis.getId(), null, null, null, analysis.getStatus(), "Empty response from FastAPI server"));
            }
            
            String label = (String) responseData.get("label");
            Double confidence = null;
            Double probability = null;
            
            Object confidenceObj = responseData.get("confidence");
            if (confidenceObj != null) {
                confidence = Double.parseDouble(confidenceObj.toString());
            }
            
            Object probabilityObj = responseData.get("probability");
            if (probabilityObj != null) {
                probability = Double.parseDouble(probabilityObj.toString());
            }
            
            String gradcamImage = (String) responseData.get("gradcam_image");
            
            // Update MriAnalysis entity
            analysis.setPrediction(label);
            analysis.setConfidence(confidence);
            analysis.setProbability(probability);
            analysis.setGradcamImage(gradcamImage);
            analysis.setStatus(MriStatus.ANALYZED);
            
            // Save updated analysis to database
            MriAnalysis savedAnalysis = mriAnalysisRepository.save(analysis);
            
            // Create notification for patient
            Notification notification = new Notification();
            notification.setUser(patient);
            notification.setTitle("MRI Analysis Completed");
            notification.setMessage("Your MRI analysis is complete. Result: " + savedAnalysis.getPrediction());
            notification.setIsRead(false);
            notificationRepository.save(notification);
            
            // Return AnalyzeMriResponse with HTTP 200
            return ResponseEntity.ok(AnalyzeMriResponse.builder()
                    .analysisId(savedAnalysis.getId())
                    .prediction(savedAnalysis.getPrediction())
                    .confidence(savedAnalysis.getConfidence())
                    .probability(savedAnalysis.getProbability())
                    .status(savedAnalysis.getStatus())
                    .message("MRI analysis completed successfully")
                    .build());
            
        } catch (RestClientException e) {
            // FastAPI server is unavailable
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AnalyzeMriResponse(analysis.getId(), null, null, null, analysis.getStatus(), "FastAPI server is unavailable: " + e.getMessage()));
        } catch (Exception e) {
            // General error handling
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AnalyzeMriResponse(analysis.getId(), null, null, null, analysis.getStatus(), "Error during analysis: " + e.getMessage()));
        }

    }

    @GetMapping("/reviewed-analyses")
public ResponseEntity<List<MriSummaryResponse>> getReviewedAnalyses(
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null || !(user instanceof Doctor)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Doctor doctor = (Doctor) user;

    List<MriAnalysis> analyses =
            mriAnalysisRepository.findByDoctor(doctor);

    List<MriSummaryResponse> responses = new ArrayList<>();

    for (MriAnalysis analysis : analyses) {

        if (analysis.getStatus() != MriStatus.ANALYZED
                && analysis.getStatus() != MriStatus.REVIEWED) {
            continue;
        }

        String patientName = "";

        if (analysis.getPatient() != null) {
            patientName =
                    analysis.getPatient().getFirstName()
                    + " "
                    + analysis.getPatient().getLastName();
        }

        responses.add(
                MriSummaryResponse.builder()
                        .id(analysis.getId())
                        .prediction(analysis.getPrediction())
                        .confidence(analysis.getConfidence())
                        .status(analysis.getStatus())
                        .createdAt(analysis.getCreatedAt())
                        .patientName(patientName)
                        .doctorNotes(analysis.getDoctorNotes())
                        .build()
        );
    }

    return ResponseEntity.ok(responses);
}

    @GetMapping("/dashboard")
public ResponseEntity<?> getDashboard(Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null || !(user instanceof Doctor)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Doctor doctor = (Doctor) user;

    long assignedPatients =
            doctor.getPatients() != null
                    ? doctor.getPatients().size()
                    : 0;

    long pendingMri =
            mriAnalysisRepository
                    .findByDoctorAndStatus(
                            doctor,
                            MriStatus.PENDING
                    )
                    .size();

    long reviewedAnalyses =
            mriAnalysisRepository
                    .findByDoctorAndStatus(
                            doctor,
                            MriStatus.REVIEWED
                    )
                    .size();

    long thisMonth =
            mriAnalysisRepository
                    .findByDoctor(doctor)
                    .stream()
                    .filter(m ->
                            m.getCreatedAt() != null &&
                            m.getCreatedAt().getMonthValue()
                                    == java.time.LocalDate.now().getMonthValue() &&
                            m.getCreatedAt().getYear()
                                    == java.time.LocalDate.now().getYear()
                    )
                    .count();

    return ResponseEntity.ok(
            DoctorDashboardResponse.builder()
                    .assignedPatients(assignedPatients)
                    .pendingMri(pendingMri)
                    .reviewedAnalyses(reviewedAnalyses)
                    .thisMonth(thisMonth)
                    .build()
    );
}

@GetMapping("/profile")
public ResponseEntity<?> getProfile(Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null || !(user instanceof Doctor)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Doctor doctor = (Doctor) user;

    Map<String, Object> response = new HashMap<>();

    response.put("id", doctor.getId());
    response.put("firstName", doctor.getFirstName());
    response.put("lastName", doctor.getLastName());
    response.put("email", doctor.getEmail());
    response.put("phone", doctor.getPhoneNumber());
    response.put("licenseNumber", doctor.getLicenseNumber());

    return ResponseEntity.ok(response);
}

@PutMapping("/profile")
public ResponseEntity<?> updateProfile(
        @RequestBody Map<String, String> request,
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null || !(user instanceof Doctor)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Doctor doctor = (Doctor) user;

    doctor.setFirstName(request.get("firstName"));
    doctor.setLastName(request.get("lastName"));

    if (request.containsKey("licenseNumber")) {
        doctor.setLicenseNumber(request.get("licenseNumber"));
    }

    userRepository.save(doctor);

    return ResponseEntity.ok(Map.of(
            "message", "Profile updated successfully"
    ));
}

    @PutMapping({"/mri/{id}/review", "/mri/{id}/submit-review"})
    public ResponseEntity<?> reviewMri(@PathVariable Long id, @RequestBody ReviewMriRequest request, Authentication authentication) {
        return performMriReview(id, request, authentication);
    }

    private ResponseEntity<?> performMriReview(Long id, ReviewMriRequest request, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        // Verify user is a doctor
        if (user == null || !(user instanceof Doctor)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ReviewMriResponse(null, null, "Authenticated user is not a doctor"));
        }
        
        Doctor doctor = (Doctor) user;
        
        // Find MRI analysis by id
        MriAnalysis analysis = mriAnalysisRepository.findById(id).orElse(null);
        if (analysis == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ReviewMriResponse(null, null, "MRI analysis not found"));
        }
        
        // Verify MRI belongs to a patient assigned to the current doctor.
        // The review endpoint accepts analyses linked either directly to the doctor
        // or indirectly through the patient's assigned doctor. This mirrors the
        // access rule used by getMriDetails() and analyzeMri().
        Patient patient = analysis.getPatient();
        boolean analysisDoctorMatches = isSameDoctor(analysis.getDoctor(), doctor);
        boolean patientDoctorMatches = isAssignedDoctor(patient, doctor);

        if (!analysisDoctorMatches && !patientDoctorMatches) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ReviewMriResponse(null, null, "This MRI is not assigned to the authenticated doctor"));
        }

        syncAnalysisDoctorIfNeeded(analysis, doctor);
        
        // If the analysis was already reviewed, allow the doctor to update the notes
        // without appending duplicate entries to the patient's medical history.
        if (analysis.getStatus().equals(MriStatus.REVIEWED)) {
            analysis.setDoctorNotes(request.getDoctorNotes());
            mriAnalysisRepository.save(analysis);

            return ResponseEntity.ok(ReviewMriResponse.builder()
                    .analysisId(analysis.getId())
                    .status(analysis.getStatus())
                    .message("MRI review updated successfully")
                    .build());
        }
        
        // Update doctorNotes and status
        analysis.setDoctorNotes(request.getDoctorNotes());
        analysis.setStatus(MriStatus.REVIEWED);
        
        // Append formatted entry to patient's medicalHistory
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String timestamp = now.format(formatter);
        
        String historyEntry = String.format(
            "[%s]\nMRI reviewed by Dr. %s %s.\nPrediction: %s\nConfidence: %.1f%%\nNotes: %s",
            timestamp,
            doctor.getFirstName(),
            doctor.getLastName(),
            analysis.getPrediction() != null ? analysis.getPrediction() : "N/A",
            analysis.getConfidence() != null ? analysis.getConfidence() * 100 : 0,
            request.getDoctorNotes() != null ? request.getDoctorNotes() : "No notes provided"
        );
        
        // Append to existing medical history
        String currentHistory = patient.getMedicalHistory() != null ? patient.getMedicalHistory() : "";
        String updatedHistory = currentHistory.isEmpty() ? historyEntry : currentHistory + "\n\n" + historyEntry;
        patient.setMedicalHistory(updatedHistory);
        
        // Save updated analysis and patient
        mriAnalysisRepository.save(analysis);
        userRepository.save(patient);
        
        // Create notification for patient
        Notification reviewNotification = new Notification();
        reviewNotification.setUser(patient);
        reviewNotification.setTitle("MRI Review Completed");
        reviewNotification.setMessage("Dr. " + doctor.getFirstName() + " " + doctor.getLastName() + " has reviewed your MRI analysis.");
        reviewNotification.setIsRead(false);
        notificationRepository.save(reviewNotification);
        
        // Return success response
        return ResponseEntity.ok(ReviewMriResponse.builder()
                .analysisId(analysis.getId())
                .status(analysis.getStatus())
                .message("MRI review completed successfully")
                .build());
    }

    private boolean isAssignedDoctor(Patient patient, Doctor doctor) {
        return patient != null && isSameDoctor(patient.getAssignedDoctor(), doctor);
    }

    private void syncAnalysisDoctorIfNeeded(MriAnalysis analysis, Doctor doctor) {
        if (analysis.getDoctor() == null
                || analysis.getDoctor().getId() == null
                || !analysis.getDoctor().getId().equals(doctor.getId())) {
            analysis.setDoctor(doctor);
        }
    }

    private boolean canAccessAnalysis(MriAnalysis analysis, Doctor doctor) {
        return analysis != null
                && (isSameDoctor(analysis.getDoctor(), doctor)
                || isAssignedDoctor(analysis.getPatient(), doctor));
    }

    private boolean isSameDoctor(Doctor candidate, Doctor doctor) {
        return candidate != null
                && candidate.getId() != null
                && candidate.getId().equals(doctor.getId());
    }
}
