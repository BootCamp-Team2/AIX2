package com.example.love_chat.service;

import com.example.love_chat.model.Message;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {

    private List<Message> messageList = new ArrayList<>();
    private final OpenAIService openAIService;

    public ChatService(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    public Message saveMessage(Message message) {
        messageList.add(message); // 메시지 저장
        return message;
    }

    public List<Message> getMessagesForUser(String username) {
        // 사용자의 메시지를 필터링
        return messageList;
    }

    public String sendMessageToOpenAI(String userMessage) {
        // OpenAIService 호출하여 답변 받기
        return openAIService.getResponse(userMessage);
    }
}
