package com.example.love_chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class OpenAIService {

    @Value("${openai.api.key}")
    private String apiKey; // API 키

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/completions"; // OpenAI API 엔드포인트

    private final RestTemplate restTemplate;

    public OpenAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getResponse(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Error: User message cannot be null or empty."; // userMessage가 null이거나 비어있으면 에러 메시지 반환
        }

        String prompt = "User: " + userMessage + "\nAI:";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = String.format(
                "{\"model\": \"text-davinci-003\", \"prompt\": \"%s\", \"max_tokens\": 150}",
                prompt.replace("\"", "\\\"") // JSON 문자열에 이스케이프 문자 처리
        );

        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(OPENAI_API_URL, HttpMethod.POST, entity,
                    String.class);
            return extractAnswer(response.getBody());
        } catch (Exception e) {
            // 예외 처리
            return "Error: Unable to fetch a response from OpenAI. " + e.getMessage();
        }
    }

    private String extractAnswer(String jsonResponse) {
        try {
            // JSON 응답에서 AI의 답변 추출
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode choicesNode = rootNode.path("choices");
            if (choicesNode.isArray() && choicesNode.size() > 0) {
                return choicesNode.get(0).path("text").asText().trim();
            } else {
                return "No response from AI.";
            }
        } catch (Exception e) {
            // JSON 파싱 실패 처리
            return "Error: Unable to parse OpenAI response. " + e.getMessage();
        }
    }
}
