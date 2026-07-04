package com.licenta.backend.repository;

import com.licenta.backend.model.SupportTicket;
import com.licenta.backend.model.SupportTicketStatus;
import com.licenta.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.licenta.backend.model.SupportTicketStatus;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    
    List<SupportTicket> findByUser(User user);
    
    List<SupportTicket> findByUserOrderByCreatedAtDesc(User user);

     long countByStatus(SupportTicketStatus status);
}

