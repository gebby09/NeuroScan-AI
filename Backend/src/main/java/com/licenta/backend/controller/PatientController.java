package com.licenta.backend.controller;

import com.licenta.backend.dto.DoctorSummaryResponse;
import com.licenta.backend.dto.MriSummaryResponse;
import com.licenta.backend.dto.MriUploadResponse;
import com.licenta.backend.dto.PatientMriHistoryResponse;
import com.licenta.backend.model.Doctor;
import com.licenta.backend.model.MriAnalysis;
import com.licenta.backend.model.MriStatus;
import com.licenta.backend.model.Patient;
import com.licenta.backend.model.User;
import com.licenta.backend.repository.MriAnalysisRepository;
import com.licenta.backend.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.HashMap;
import java.io.File;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.licenta.backend.model.Notification;
import com.licenta.backend.repository.NotificationRepository;

@RestController
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientController {

    private final UserRepository userRepository;
    private final MriAnalysisRepository mriAnalysisRepository;
    private final String uploadsDir = "uploads";
    private final NotificationRepository notificationRepository;

    @GetMapping("/my-doctor")
    public ResponseEntity<DoctorSummaryResponse> getMyDoctor(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null || !(user instanceof Patient)) {
            return ResponseEntity.notFound().build();
        }
        
        Patient patient = (Patient) user;
        Doctor assignedDoctor = patient.getAssignedDoctor();
        
        if (assignedDoctor == null) {
            return ResponseEntity.notFound().build();
        }
        
        DoctorSummaryResponse response = DoctorSummaryResponse.builder()
                .id(assignedDoctor.getId())
                .firstName(assignedDoctor.getFirstName())
                .lastName(assignedDoctor.getLastName())
                .email(assignedDoctor.getEmail())
                .licenseNumber(assignedDoctor.getLicenseNumber())
                .build();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/mri/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MriUploadResponse> uploadMri(
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {
        
        // Get patient from JWT email
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null || !(user instanceof Patient)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Patient patient = (Patient) user;
        
        // Check if patient has an assigned doctor
        if (patient.getAssignedDoctor() == null) {
            MriUploadResponse errorResponse = MriUploadResponse.builder()
                    .message("No doctor assigned to this patient")
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        try {
            // Create uploads directory if it doesn't exist
            File uploadsDirectory = new File(uploadsDir);
            if (!uploadsDirectory.exists()) {
                uploadsDirectory.mkdirs();
            }
            
            // Generate unique filename
            String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String filePath = uploadsDir + File.separator + filename;
            
            // Save file to disk
            Files.write(Paths.get(filePath), image.getBytes());
            
            // Create MriAnalysis entity
            MriAnalysis analysis = new MriAnalysis();
            analysis.setPatient(patient);
            analysis.setDoctor(patient.getAssignedDoctor());
            analysis.setImagePath(filePath);
            analysis.setStatus(MriStatus.PENDING);
            analysis.setPrediction(null);
            analysis.setConfidence(null);
            analysis.setDoctorNotes(null);
            
            // Save to database
            MriAnalysis savedAnalysis = mriAnalysisRepository.save(analysis);
            Notification notification = new Notification();

notification.setUser(patient.getAssignedDoctor());

notification.setTitle("New MRI Request");

notification.setMessage(
        patient.getFirstName()
        + " "
        + patient.getLastName()
        + " uploaded a new MRI for review."
);

notification.setIsRead(false);

notificationRepository.save(notification);


            MriUploadResponse response = MriUploadResponse.builder()
                    .message("MRI image uploaded successfully")
                    .analysisId(savedAnalysis.getId())
                    .status(savedAnalysis.getStatus().toString())
                    .build();
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IOException e) {
            MriUploadResponse errorResponse = MriUploadResponse.builder()
                    .message("Failed to upload MRI image: " + e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/mri")
    public ResponseEntity<List<MriSummaryResponse>> getMyMriAnalyses(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null || !(user instanceof Patient)) {
            return ResponseEntity.notFound().build();
        }
        
        Patient patient = (Patient) user;
        List<MriAnalysis> analyses = mriAnalysisRepository.findByPatient(patient);
        List<MriSummaryResponse> responses = new ArrayList<>();
        
        for (MriAnalysis analysis : analyses) {
            MriSummaryResponse response = MriSummaryResponse.builder()
                    .id(analysis.getId())
                    .prediction(analysis.getPrediction())
                    .confidence(analysis.getConfidence())
                    .status(analysis.getStatus())
                    .createdAt(analysis.getCreatedAt())
                    .build();
            responses.add(response);
        }
        
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/mri/history")
    public ResponseEntity<List<PatientMriHistoryResponse>> getMriHistory(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        // Verify user is a patient
        if (user == null || !(user instanceof Patient)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Patient patient = (Patient) user;
        
        // Get all MRI analyses for the patient
        List<MriAnalysis> analyses = mriAnalysisRepository.findByPatient(patient);
        List<PatientMriHistoryResponse> responses = new ArrayList<>();
        
        // Map each analysis to response DTO ordered by newest first
        for (int i = analyses.size() - 1; i >= 0; i--) {
            MriAnalysis analysis = analyses.get(i);
            
            // Format doctor name
            String doctorName = "N/A";
            if (analysis.getDoctor() != null) {
                doctorName = String.format("Dr. %s %s", 
                    analysis.getDoctor().getFirstName(), 
                    analysis.getDoctor().getLastName());
            }
            
            PatientMriHistoryResponse response = PatientMriHistoryResponse.builder()
                    .id(analysis.getId())
                    .prediction(analysis.getPrediction())
                    .confidence(analysis.getConfidence())
                    .probability(analysis.getProbability())
                    .status(analysis.getStatus())
                    .doctorNotes(analysis.getDoctorNotes())
                    .gradcamImage(analysis.getGradcamImage())
                    .createdAt(analysis.getCreatedAt())
                    .doctorName(doctorName)
                    .build();
            
            responses.add(response);
        }
        
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/mri/{id}")
public ResponseEntity<?> getMriDetails(
        @PathVariable Long id,
        Authentication authentication) {

    String email = authentication.getName();
    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null || !(user instanceof Patient)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    Patient patient = (Patient) user;

    Optional<MriAnalysis> optional = mriAnalysisRepository.findById(id);

    if (optional.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    MriAnalysis mri = optional.get();

    if (!mri.getPatient().getId().equals(patient.getId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    String doctorName = null;

    if (mri.getDoctor() != null) {
        doctorName =
                mri.getDoctor().getFirstName()
                + " "
                + mri.getDoctor().getLastName();
    }

    Map<String, Object> response = new HashMap<>();

    response.put("id", mri.getId());
    response.put("prediction", mri.getPrediction());
    response.put("confidence", mri.getConfidence());
    response.put("probability", mri.getProbability());
    response.put("status", mri.getStatus());
    response.put("createdAt", mri.getCreatedAt());
    response.put("doctorName", doctorName);
    response.put("doctorNotes", mri.getDoctorNotes());
    response.put("gradcamImage", mri.getGradcamImage());

String imageUrl = null;

if (mri.getImagePath() != null) {

    String fileName =
            new File(mri.getImagePath()).getName();

    imageUrl =
            "http://localhost:8080/uploads/" + fileName;
}

response.put("imageUrl", imageUrl);


    return ResponseEntity.ok(response);
}

    @GetMapping("/mri/{id}/pdf")
    public ResponseEntity<byte[]> exportMriPdf(
            @PathVariable Long id,
            Authentication authentication) {
        
        // Get authenticated patient
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null || !(user instanceof Patient)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Patient patient = (Patient) user;
        
        // Verify MRI analysis exists
        Optional<MriAnalysis> mriOptional = mriAnalysisRepository.findById(id);
        if (mriOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        MriAnalysis mri = mriOptional.get();
        
        // Verify MRI belongs to current patient
        if (!mri.getPatient().getId().equals(patient.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        try {
            // Generate PDF
            byte[] pdfBytes = generateMriPdf(mri);
            
            // Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "mri-analysis-" + id + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
                    
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private byte[] generateMriPdf(MriAnalysis mri) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        
        try {
            PdfWriter.getInstance(document, baos);
            document.open();
            
            // Title
            Font titleFont = new Font(Font.HELVETICA, 24, Font.BOLD, Color.DARK_GRAY);
            Paragraph title = new Paragraph("Brain Tumor MRI Analysis Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            // Patient Information Section
            Font sectionFont = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font labelFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            Font contentFont = new Font(Font.HELVETICA, 10);
            
            document.add(createSectionTitle("Patient Information", sectionFont));
            document.add(createInfoRow("Name:", mri.getPatient().getFirstName() + " " + mri.getPatient().getLastName(), labelFont, contentFont));
            document.add(createInfoRow("Email:", mri.getPatient().getEmail(), labelFont, contentFont));
            document.add(new Paragraph("\n"));
            
            // AI Analysis Results / Manual Review Section
if (mri.getPrediction() != null) {

    document.add(createSectionTitle("AI Analysis Results", sectionFont));

    document.add(createInfoRow(
            "Prediction:",
            mri.getPrediction(),
            labelFont,
            contentFont));

    document.add(createInfoRow(
            "Confidence:",
            mri.getConfidence() != null
                    ? String.format("%.2f%%", mri.getConfidence() * 100)
                    : "N/A",
            labelFont,
            contentFont));

    document.add(createInfoRow(
            "Probability:",
            mri.getProbability() != null
                    ? String.format("%.4f", mri.getProbability())
                    : "N/A",
            labelFont,
            contentFont));

} else {

    document.add(createSectionTitle("Manual Doctor Review", sectionFont));

    document.add(createInfoRow(
            "Review Type:",
            "Manual clinical assessment",
            labelFont,
            contentFont));
}

document.add(createInfoRow(
        "Status:",
        mri.getStatus().toString(),
        labelFont,
        contentFont));

document.add(createInfoRow(
        "Upload Date:",
        mri.getCreatedAt().toString(),
        labelFont,
        contentFont));

document.add(new Paragraph("\n"));
            
            // Doctor Information Section
            if (mri.getDoctor() != null) {
                document.add(createSectionTitle("Doctor Information", sectionFont));
                document.add(createInfoRow("Doctor:", "Dr. " + mri.getDoctor().getFirstName() + " " + mri.getDoctor().getLastName(), labelFont, contentFont));
                document.add(new Paragraph("\n"));
            }
            
            // Doctor Notes Section
            if (mri.getDoctorNotes() != null && !mri.getDoctorNotes().isEmpty()) {
                document.add(createSectionTitle("Doctor Notes", sectionFont));
                Paragraph notesParagraph = new Paragraph(mri.getDoctorNotes(), contentFont);
                notesParagraph.setSpacingAfter(15);
                document.add(notesParagraph);
            }
            
            // Original MRI Image
            if (mri.getImagePath() != null && !mri.getImagePath().isEmpty()) {
                try {
                    File imageFile = new File(mri.getImagePath());
                    if (imageFile.exists()) {
                        document.newPage();
                        document.add(createSectionTitle("Original MRI Image", sectionFont));
                        Image mriImage = Image.getInstance(mri.getImagePath());
                        // Resize image to fit page width
                        mriImage.scaleToFit(500, 400);
                        mriImage.setAlignment(Element.ALIGN_CENTER);
                        document.add(mriImage);
                        document.add(new Paragraph("\n"));
                    }
                } catch (Exception e) {
                    // Image loading failed, continue without it
                }
            }
            
            // GradCAM Image
            if (mri.getGradcamImage() != null && !mri.getGradcamImage().isEmpty()) {
                try {
                    document.newPage();
                    document.add(createSectionTitle("GradCAM Visualization", sectionFont));
                    // Decode base64 image
                    byte[] decodedImage = Base64.getDecoder().decode(mri.getGradcamImage());
                    Image gradcamImg = Image.getInstance(decodedImage);
                    // Resize image to fit page width
                    gradcamImg.scaleToFit(500, 400);
                    gradcamImg.setAlignment(Element.ALIGN_CENTER);
                    document.add(gradcamImg);
                } catch (Exception e) {
                    // Image decoding failed, continue without it
                }
            }
            
            document.close();
            
        } catch (Exception e) {
            document.close();
            throw new IOException("Failed to generate PDF: " + e.getMessage(), e);
        }
        
        return baos.toByteArray();
    }

    private Paragraph createSectionTitle(String title, Font font) {
        Paragraph section = new Paragraph(title, font);
        section.setSpacingBefore(10);
        section.setSpacingAfter(10);
        return section;
    }

    private Paragraph createInfoRow(String label, String value, Font labelFont, Font contentFont) {
        Paragraph row = new Paragraph();
        row.add(new Paragraph(label + " ", labelFont));
        row.add(new Paragraph(value, contentFont));
        row.setSpacingAfter(5);
        return row;
    }
}
