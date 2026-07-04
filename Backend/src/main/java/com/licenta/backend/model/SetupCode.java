package com.licenta.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "setup_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SetupCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String codeHash;

    @Column(nullable = false)
    private boolean used = false;

    private LocalDateTime createdAt;

    private LocalDateTime usedAt;

    private Integer failedAttempts = 0;

    private LocalDateTime lockedUntil;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
