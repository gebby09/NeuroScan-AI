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
@RequestMapping("/support")
@RequiredArgsConstructor
public class SupportController {

    private final UserRepository userRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final SupportMessageRepository supportMessageRepository;
    private final NotificationRepository notificationRepository;

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicketResponse> createSupportTicket(
            @RequestBody CreateSupportTicketRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setSubject(request.getSubject());
        ticket.setStatus(SupportTicketStatus.OPEN);

        SupportTicket savedTicket = supportTicketRepository.save(ticket);

        SupportMessage firstMessage = new SupportMessage();
        firstMessage.setTicket(savedTicket);
        firstMessage.setSenderRole(user.getRole().toString());
        firstMessage.setMessage(request.getMessage());

        supportMessageRepository.save(firstMessage);

        List<User> admins = userRepository.findByRole(Role.ADMIN);

        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setUser(admin);
            notification.setTitle("New support ticket");
            notification.setMessage(user.getFirstName() + " " + user.getLastName()
                    + " created a new support ticket: " + savedTicket.getSubject());
            notification.setIsRead(false);

            notificationRepository.save(notification);
        }

        User ticketUser = savedTicket.getUser();

        String userName = ticketUser != null
                ? ticketUser.getFirstName() + " " + ticketUser.getLastName()
                : null;

        SupportTicketResponse response = new SupportTicketResponse();
        response.setId(savedTicket.getId());
        response.setSubject(savedTicket.getSubject());
        response.setStatus(savedTicket.getStatus());
        response.setCreatedAt(savedTicket.getCreatedAt());
        response.setUserName(userName);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicketResponse>> getUserTickets(Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<SupportTicket> tickets = supportTicketRepository.findByUserOrderByCreatedAtDesc(user);
        List<SupportTicketResponse> responses = new ArrayList<>();

        for (SupportTicket ticket : tickets) {
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

            responses.add(response);
        }

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/tickets/{id}/messages")
    public ResponseEntity<List<SupportMessageResponse>> getTicketMessages(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<SupportTicket> ticketOptional = supportTicketRepository.findById(id);
        if (ticketOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SupportTicket ticket = ticketOptional.get();

        if (!ticket.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

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

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<SupportTicket> ticketOptional = supportTicketRepository.findById(id);
        if (ticketOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SupportTicket ticket = ticketOptional.get();

        if (!ticket.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (ticket.getStatus().equals(SupportTicketStatus.CLOSED)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        SupportMessage message = new SupportMessage();
        message.setTicket(ticket);
        message.setSenderRole(user.getRole().toString());
        message.setMessage(request.getMessage());

        SupportMessage savedMessage = supportMessageRepository.save(message);

        List<User> admins = userRepository.findByRole(Role.ADMIN);

        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setUser(admin);
            notification.setTitle("New support message");
            notification.setMessage(user.getFirstName() + " " + user.getLastName()
                    + " replied to support ticket: " + ticket.getSubject());
            notification.setIsRead(false);

            notificationRepository.save(notification);
        }

        SupportMessageResponse response = SupportMessageResponse.builder()
                .senderRole(savedMessage.getSenderRole())
                .message(savedMessage.getMessage())
                .createdAt(savedMessage.getCreatedAt())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}