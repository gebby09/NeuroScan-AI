package com.licenta.backend.controller;

import com.licenta.backend.dto.CurrentUserResponse;
import com.licenta.backend.dto.LoginRequest;
import com.licenta.backend.dto.LoginResponse;
import com.licenta.backend.dto.PatientRegisterRequest;
import com.licenta.backend.dto.RegisterResponse;
import com.licenta.backend.model.Patient;
import com.licenta.backend.model.Role;
import com.licenta.backend.model.User;
import com.licenta.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.licenta.backend.model.Notification;
import com.licenta.backend.repository.NotificationRepository;
import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.licenta.backend.security.JwtService jwtService;
    private final NotificationRepository notificationRepository;

@PostMapping("/change-password")
public ResponseEntity<?> changePassword(
        @RequestBody Map<String, String> request,
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    String currentPassword = request.get("currentPassword");
    String newPassword = request.get("newPassword");

    if (!passwordEncoder.matches(
            currentPassword,
            user.getPassword())) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "message",
                        "Current password is incorrect"
                ));
    }

    user.setPassword(
            passwordEncoder.encode(newPassword)
    );

    userRepository.save(user);

    return ResponseEntity.ok(Map.of(
            "message",
            "Password changed successfully"
    ));
}



    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody PatientRegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            RegisterResponse errorResponse = RegisterResponse.builder()
                    .message("Email already exists")
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        Patient patient = new Patient();
        
        // Set common user fields
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPassword(passwordEncoder.encode(request.getPassword()));
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setRole(Role.PATIENT);
        
        // Set patient-specific fields
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setBiologicalSex(request.getBiologicalSex());
        patient.setHeightCm(request.getHeightCm());
        patient.setWeightKg(request.getWeightKg());
        patient.setAddress(request.getAddress());
        patient.setMedicalHistory(request.getMedicalHistory());
        
        Patient savedPatient = userRepository.save(patient);
        
List<User> admins = userRepository.findByRole(Role.ADMIN);

for (User admin : admins) {
    Notification notification = new Notification();
    notification.setUser(admin);
    notification.setTitle("New patient account");
    notification.setMessage(
            "A new patient account was created: "
                    + savedPatient.getFirstName()
                    + " "
                    + savedPatient.getLastName()
    );
    notification.setIsRead(false);

    notificationRepository.save(notification);
}

        RegisterResponse response = RegisterResponse.builder()
                .id(savedPatient.getId())
                .firstName(savedPatient.getFirstName())
                .lastName(savedPatient.getLastName())
                .email(savedPatient.getEmail())
                .role(savedPatient.getRole().toString())
                .message("Patient registered successfully")
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

        @PostMapping("/login")
        public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElse(null);

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            LoginResponse errorResponse = LoginResponse.builder()
                .message("Invalid email or password")
                .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        String token = jwtService.generateToken(user);

        LoginResponse successResponse = LoginResponse.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getRole() != null ? user.getRole().toString() : null)
            .message("Login successful")
            .token(token)
            .build();
        return ResponseEntity.ok(successResponse);
        }
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Collections.singletonMap("message", "User not found or unauthorized"));
        }
        com.licenta.backend.dto.CurrentUserResponse response = com.licenta.backend.dto.CurrentUserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().toString() : null)
                .phoneNumber(user.getPhoneNumber())
                .build();
        return ResponseEntity.ok(response);
    }
}