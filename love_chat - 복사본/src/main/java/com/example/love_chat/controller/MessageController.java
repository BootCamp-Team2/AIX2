package com.example.love_chat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.love_chat.model.Message;
import com.example.love_chat.service.MessageService;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public Message sendMessage(@RequestBody Message message) {
        return messageService.saveMessage(message); // 메시지 저장
    }

    @GetMapping("/{username}")
    public List<Message> getMessages(@PathVariable String username) {
        return messageService.getMessagesForUser(username); // 해당 사용자의 메시지 불러오기
    }
}
