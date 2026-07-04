package com.licenta.backend.controller;

import com.licenta.backend.dto.ChatbotRequest;
import com.licenta.backend.dto.ChatbotResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_MODEL = "gemini-2.5-flash";
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

    private static final String SYSTEM_PROMPT = """
        You are a medical information assistant focused on healthcare support, particularly related to brain tumors, MRI scans, and neurology.
        
        Your role is to:
        - Provide informational and educational content about these medical topics
        - Help users understand medical procedures and health conditions
        - Offer general wellness and healthcare support information
        - Direct users to licensed medical professionals for diagnosis and treatment
        
        Important guidelines:
        - NEVER provide definitive diagnoses
        - NEVER prescribe medications or treatments
        - NEVER provide emergency medical advice
        - For serious symptoms or emergencies, always recommend consulting a licensed doctor immediately
        - Keep answers concise, helpful, and beginner-friendly
        - Be empathetic and professional in your responses
        
        For unrelated topics, politely explain that you specialize in healthcare information and suggest the user ask healthcare-related questions instead.
        
        Always prioritize user safety and encourage professional medical consultation when appropriate.
        """;

    @PostMapping("/ask")
    public ResponseEntity<ChatbotResponse> askChatbot(
            @Valid @RequestBody ChatbotRequest request,
            Authentication authentication) {

        // Verify user is authenticated
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String response = callGeminiApi(request.getMessage());
            
            ChatbotResponse chatbotResponse = ChatbotResponse.builder()
                    .response(response)
                    .build();
            
            return ResponseEntity.ok(chatbotResponse);
            
        } catch (RestClientException e) {
    e.printStackTrace();

             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ChatbotResponse.builder()
                    .response("Failed to get response from AI service. Please try again later.")
                    .build());

        } catch (Exception e) {
    e.printStackTrace();

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ChatbotResponse.builder()
                    .response("An error occurred while processing your request.")
                    .build());
}
    }

    private String callGeminiApi(String userMessage) {
        // Build request
        Map<String, Object> requestBody = buildGeminiRequest(userMessage);
        
        // Call Gemini API
        String url = GEMINI_API_URL.replace("{model}", GEMINI_MODEL) + "?key=" + geminiApiKey;
        
        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
        
        // Extract response text
        if (response != null && response.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                if (candidate.containsKey("content")) {
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    if (content.containsKey("parts")) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map<String, Object> part = parts.get(0);
                            if (part.containsKey("text")) {
                                return (String) part.get("text");
                            }
                        }
                    }
                }
            }
        }
        
        throw new RuntimeException("Invalid response format from Gemini API");
    }

    private Map<String, Object> buildGeminiRequest(String userMessage) {
        Map<String, Object> request = new LinkedHashMap<>();
        
        // Add system instruction
        Map<String, Object> systemInstruction = new LinkedHashMap<>();
        Map<String, Object> systemParts = new LinkedHashMap<>();
        systemParts.put("text", SYSTEM_PROMPT);
        systemInstruction.put("parts", List.of(systemParts));
        request.put("systemInstruction", systemInstruction);
        
        // Add user message
        Map<String, Object> userContent = new LinkedHashMap<>();
        userContent.put("role", "user");
        
        Map<String, Object> userPart = new LinkedHashMap<>();
        userPart.put("text", userMessage);
        userContent.put("parts", List.of(userPart));
        
        request.put("contents", List.of(userContent));
        
        return request;
    }
}
