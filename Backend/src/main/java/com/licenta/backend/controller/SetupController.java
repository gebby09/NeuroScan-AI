package com.licenta.backend.controller;

import com.licenta.backend.dto.AdminRegisterRequest;
import com.licenta.backend.dto.AdminRegisterResponse;
import com.licenta.backend.model.Admin;
import com.licenta.backend.model.Role;
import com.licenta.backend.model.SetupCode;
import com.licenta.backend.repository.SetupCodeRepository;
import com.licenta.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/setup")
@RequiredArgsConstructor
public class SetupController {

    private final UserRepository userRepository;
    private final SetupCodeRepository setupCodeRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register-admin")
    public ResponseEntity<AdminRegisterResponse> registerAdmin(@Valid @RequestBody AdminRegisterRequest request) {
        
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            AdminRegisterResponse errorResponse = AdminRegisterResponse.builder()
                    .message("Email already exists")
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        // Check that no admin already exists
        if (userRepository.existsByRole(Role.ADMIN)) {
            AdminRegisterResponse errorResponse = AdminRegisterResponse.builder()
                    .message("An admin account already exists")
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        // Find the unused setup code
        SetupCode setupCode = setupCodeRepository.findFirstByUsedFalse()
                .orElse(null);

        if (setupCode == null) {
            AdminRegisterResponse errorResponse = AdminRegisterResponse.builder()
                    .message("No valid setup code available")
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        // Check if setup code is locked
        if (setupCode.getLockedUntil() != null && setupCode.getLockedUntil().isAfter(LocalDateTime.now())) {
            AdminRegisterResponse errorResponse = AdminRegisterResponse.builder()
                    .message("Setup code is locked due to too many failed attempts. Please try again later")
                    .build();
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorResponse);
        }

        // Verify the setup code
        if (!passwordEncoder.matches(request.getSetupCode(), setupCode.getCodeHash())) {
            // Increment failed attempts
            setupCode.setFailedAttempts(setupCode.getFailedAttempts() + 1);
            
            // Lock if 3 failed attempts
            if (setupCode.getFailedAttempts() >= 3) {
                setupCode.setLockedUntil(LocalDateTime.now().plusMinutes(10));
            }
            
            setupCodeRepository.save(setupCode);

            AdminRegisterResponse errorResponse = AdminRegisterResponse.builder()
                    .message("Invalid setup code")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        // Setup code is valid - create the admin
        Admin admin = new Admin();
        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setPhoneNumber(request.getPhoneNumber());
        admin.setRole(Role.ADMIN);

        Admin savedAdmin = userRepository.save(admin);

        // Mark setup code as used
        setupCode.setUsed(true);
        setupCode.setUsedAt(LocalDateTime.now());
        setupCodeRepository.save(setupCode);

        AdminRegisterResponse response = AdminRegisterResponse.builder()
                .id(savedAdmin.getId())
                .firstName(savedAdmin.getFirstName())
                .lastName(savedAdmin.getLastName())
                .email(savedAdmin.getEmail())
                .role(savedAdmin.getRole().toString())
                .message("Admin account created successfully")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
