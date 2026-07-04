package com.licenta.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSupportTicketRequest {
    private String subject;
    private String message;
}
