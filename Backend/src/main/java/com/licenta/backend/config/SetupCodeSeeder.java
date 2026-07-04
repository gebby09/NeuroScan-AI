package com.licenta.backend.config;

import com.licenta.backend.model.Role;
import com.licenta.backend.model.SetupCode;
import com.licenta.backend.repository.SetupCodeRepository;
import com.licenta.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SetupCodeSeeder {

    private final UserRepository userRepository;
    private final SetupCodeRepository setupCodeRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void seedSetupCode() {
        // Check if any admin already exists
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }

        // Check if unused setup code already exists
        if (setupCodeRepository.findFirstByUsedFalse().isPresent()) {
            return;
        }

        // Generate a long random setup code
        String plainCode = UUID.randomUUID().toString();
        String hashedCode = passwordEncoder.encode(plainCode);

        // Save the setup code
        SetupCode setupCode = new SetupCode();
        setupCode.setCodeHash(hashedCode);
        setupCode.setUsed(false);
        setupCode.setFailedAttempts(0);
        setupCodeRepository.save(setupCode);

        // Print the setup code once for development/demo
        System.out.println("\n═══════════════════════════════════════════════════════════════");
        System.out.println("🔐 FIRST ADMIN SETUP CODE (One-time use):");
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("Setup Code: " + plainCode);
        System.out.println("───────────────────────────────────────────────────────────────");
        System.out.println("Use this code to create the first admin account at:");
        System.out.println("POST /setup/register-admin");
        System.out.println("═══════════════════════════════════════════════════════════════\n");
    }
}
