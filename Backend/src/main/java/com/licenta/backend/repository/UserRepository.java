package com.licenta.backend.repository;

import com.licenta.backend.model.Role;
import com.licenta.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    boolean existsByRole(Role role);

    List<User> findByRole(Role role);
}