package com.licenta.backend.controller;

import com.licenta.backend.dto.NotificationResponse;
import com.licenta.backend.model.Notification;
import com.licenta.backend.model.User;
import com.licenta.backend.repository.NotificationRepository;
import com.licenta.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(Authentication authentication) {
        
        // Get authenticated user
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get notifications for user ordered newest first
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        List<NotificationResponse> responses = new ArrayList<>();
        
        for (Notification notification : notifications) {
            NotificationResponse response = NotificationResponse.builder()
                    .id(notification.getId())
                    .title(notification.getTitle())
                    .message(notification.getMessage())
                    .isRead(notification.getIsRead())
                    .createdAt(notification.getCreatedAt())
                    .build();
            responses.add(response);
        }
        
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/read-all")
public ResponseEntity<Void> markAllAsRead(Authentication authentication) {

    String email = authentication.getName();
    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);

    for (Notification notification : notifications) {
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    return ResponseEntity.ok().build();
}

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        
        // Get authenticated user
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Verify notification exists
        Optional<Notification> notificationOptional = notificationRepository.findById(id);
        if (notificationOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Notification notification = notificationOptional.get();
        
        // Verify notification belongs to authenticated user
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Mark as read
        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        
        // Return updated notification response
        NotificationResponse response = NotificationResponse.builder()
                .id(updatedNotification.getId())
                .title(updatedNotification.getTitle())
                .message(updatedNotification.getMessage())
                .isRead(updatedNotification.getIsRead())
                .createdAt(updatedNotification.getCreatedAt())
                .build();
        
        return ResponseEntity.ok(response);
    }
}
