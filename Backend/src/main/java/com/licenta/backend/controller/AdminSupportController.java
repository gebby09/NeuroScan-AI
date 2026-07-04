package com.licenta.backend.controller;

import com.licenta.backend.dto.CreateSupportTicketRequest;
import com.licenta.backend.dto.SupportMessageResponse;
import com.licenta.backend.dto.SupportTicketResponse;
import com.licenta.backend.model.Notification;
import com.licenta.backend.model.Role;
import com.licenta.backend.model.SupportMessage;
import com.licenta.backend.model.SupportTicket;
import com.licenta.backend.model.SupportTicketStatus;
import com.licenta.backend.model.User;
import com.licenta.backend.repository.NotificationRepository;
import com.licenta.backend.repository.SupportMessageRepository;
import com.licenta.backend.repository.SupportTicketRepository;
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
@RequestMapping("/admin/support")
@RequiredArgsConstructor
public class AdminSupportController {

    private final UserRepository userRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final SupportMessageRepository supportMessageRepository;
    private final NotificationRepository notificationRepository;

    private ResponseEntity<?> verifyAdmin(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null || !user.getRole().equals(Role.ADMIN)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return null;
    }

    private void createNotification(User user, String title, String message) {
        if (user == null) return;

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    private SupportTicketResponse mapTicketToResponse(SupportTicket ticket) {
        User ticketUser = ticket.getUser();

        String userName = ticketUser != null
                ? ticketUser.getFirstName() + " " + ticketUser.getLastName()
                : null;

        SupportTicketResponse response = new SupportTicketResponse();
        response.setId(ticket.getId());
        response.setSubject(ticket.getSubject());
        response.setStatus(ticket.getStatus());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUserName(userName);

        return response;
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicketResponse>> getAllTickets(Authentication authentication) {
        ResponseEntity<?> adminCheck = verifyAdmin(authentication);
        if (adminCheck != null) {
            return (ResponseEntity<List<SupportTicketResponse>>) adminCheck;
        }

        List<SupportTicket> tickets = supportTicketRepository.findAll();
        tickets.sort((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()));

        List<SupportTicketResponse> responses = new ArrayList<>();

        for (SupportTicket ticket : tickets) {
            responses.add(mapTicketToResponse(ticket));
        }

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/tickets/{id}/messages")
    public ResponseEntity<List<SupportMessageResponse>> getTicketMessages(
            @PathVariable Long id,
            Authentication authentication) {

        ResponseEntity<?> adminCheck = verifyAdmin(authentication);
        if (adminCheck != null) {
            return (ResponseEntity<List<SupportMessageResponse>>) adminCheck;
        }

        Optional<SupportTicket> ticketOptional = supportTicketRepository.findById(id);
        if (ticketOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SupportTicket ticket = ticketOptional.get();

        List<SupportMessage> messages = supportMessageRepository.findByTicketOrderByCreatedAtAsc(ticket);
        List<SupportMessageResponse> responses = new ArrayList<>();

        for (SupportMessage message : messages) {
            SupportMessageResponse response = SupportMessageResponse.builder()
                    .senderRole(message.getSenderRole())
                    .message(message.getMessage())
                    .createdAt(message.getCreatedAt())
                    .build();

            responses.add(response);
        }

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/tickets/{id}/messages")
    public ResponseEntity<SupportMessageResponse> addMessageToTicket(
            @PathVariable Long id,
            @RequestBody CreateSupportTicketRequest request,
            Authentication authentication) {

        ResponseEntity<?> adminCheck = verifyAdmin(authentication);
        if (adminCheck != null) {
            return (ResponseEntity<SupportMessageResponse>) adminCheck;
        }

        Optional<SupportTicket> ticketOptional = supportTicketRepository.findById(id);
        if (ticketOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SupportTicket ticket = ticketOptional.get();

        if (ticket.getStatus().equals(SupportTicketStatus.CLOSED)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        SupportMessage message = new SupportMessage();
        message.setTicket(ticket);
        message.setSenderRole(Role.ADMIN.toString());
        message.setMessage(request.getMessage());

        SupportMessage savedMessage = supportMessageRepository.save(message);

        createNotification(
                ticket.getUser(),
                "Support ticket reply",
                "Admin replied to your support ticket: " + ticket.getSubject()
        );

        SupportMessageResponse response = SupportMessageResponse.builder()
                .senderRole(savedMessage.getSenderRole())
                .message(savedMessage.getMessage())
                .createdAt(savedMessage.getCreatedAt())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/tickets/{id}/close")
    public ResponseEntity<SupportTicketResponse> closeTicket(
            @PathVariable Long id,
            Authentication authentication) {

        ResponseEntity<?> adminCheck = verifyAdmin(authentication);
        if (adminCheck != null) {
            return (ResponseEntity<SupportTicketResponse>) adminCheck;
        }

        Optional<SupportTicket> ticketOptional = supportTicketRepository.findById(id);
        if (ticketOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SupportTicket ticket = ticketOptional.get();
        ticket.setStatus(SupportTicketStatus.CLOSED);

        SupportTicket updatedTicket = supportTicketRepository.save(ticket);

        createNotification(
                updatedTicket.getUser(),
                "Support ticket closed",
                "Your support ticket was closed: " + updatedTicket.getSubject()
        );

        return ResponseEntity.ok(mapTicketToResponse(updatedTicket));
    }

    @PutMapping("/tickets/{id}/reopen")
    public ResponseEntity<SupportTicketResponse> reopenTicket(
            @PathVariable Long id,
            Authentication authentication) {

        ResponseEntity<?> adminCheck = verifyAdmin(authentication);
        if (adminCheck != null) {
            return (ResponseEntity<SupportTicketResponse>) adminCheck;
        }

        Optional<SupportTicket> ticketOptional = supportTicketRepository.findById(id);
        if (ticketOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SupportTicket ticket = ticketOptional.get();
        ticket.setStatus(SupportTicketStatus.OPEN);

        SupportTicket updatedTicket = supportTicketRepository.save(ticket);

        createNotification(
                updatedTicket.getUser(),
                "Support ticket reopened",
                "Your support ticket was reopened: " + updatedTicket.getSubject()
        );

        return ResponseEntity.ok(mapTicketToResponse(updatedTicket));
    }
}