package com.example.love_chat.service;

import com.example.love_chat.model.UserChatRecord;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {

    private List<UserChatRecord> messageList = new ArrayList<>();
    private final OpenAIService openAIService;

    public ChatService(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    public UserChatRecord saveMessage(UserChatRecord message) {
        messageList.add(message); // 메시지 저장
        return message;
    }

    public List<UserChatRecord> getMessagesForUser(String username) {
        // 사용자의 메시지를 필터링
        return messageList;
    }

    public String sendMessageToOpenAI(String userMessage) {
        // OpenAIService 호출하여 답변 받기
        return openAIService.getResponse(userMessage);
    }
}
