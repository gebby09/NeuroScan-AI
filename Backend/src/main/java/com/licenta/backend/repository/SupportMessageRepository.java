package com.licenta.backend.repository;

import com.licenta.backend.model.SupportMessage;
import com.licenta.backend.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    
    List<SupportMessage> findByTicket(SupportTicket ticket);
    
    List<SupportMessage> findByTicketOrderByCreatedAtAsc(SupportTicket ticket);
}
