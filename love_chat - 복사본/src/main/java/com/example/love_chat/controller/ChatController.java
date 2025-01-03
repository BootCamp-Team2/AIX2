package com.example.love_chat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.love_chat.model.Message;
import com.example.love_chat.service.ChatService;

import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public Message sendMessage(@RequestBody Message message) {
        return chatService.saveMessage(message); // 메시지 저장
    }

    @GetMapping("/{username}")
    public List<Message> getMessages(@PathVariable String username) {
        return chatService.getMessagesForUser(username); // 해당 사용자의 메시지 불러오기
    }
}
