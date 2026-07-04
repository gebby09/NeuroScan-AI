package com.licenta.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportMessageResponse {
    private String senderRole;
    private String message;
    private LocalDateTime createdAt;
}
