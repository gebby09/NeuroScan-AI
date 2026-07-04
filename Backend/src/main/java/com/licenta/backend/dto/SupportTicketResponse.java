package com.licenta.backend.dto;

import com.licenta.backend.model.SupportTicketStatus;
import java.time.LocalDateTime;

public class SupportTicketResponse {
    private Long id;
    private String subject;
    private SupportTicketStatus status;
    private LocalDateTime createdAt;
    private String userName;

    public SupportTicketResponse() {
    }

    public SupportTicketResponse(Long id, String subject, SupportTicketStatus status, LocalDateTime createdAt, String userName) {
        this.id = id;
        this.subject = subject;
        this.status = status;
        this.createdAt = createdAt;
        this.userName = userName;
    }

    public Long getId() {
        return id;
    }

    public String getSubject() {
        return subject;
    }

    public SupportTicketStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getUserName() {
        return userName;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setStatus(SupportTicketStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}