package com.licenta.backend.repository;

import com.licenta.backend.model.SetupCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SetupCodeRepository extends JpaRepository<SetupCode, Long> {
    Optional<SetupCode> findFirstByUsedFalse();
}
