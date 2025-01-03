package com.example.love_chat.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.love_chat.model.Message;
import com.example.love_chat.repository.MessageRepository;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getMessagesForUser(String username) {
        return messageRepository.findByReceiver(username); // 수신자가 해당 사용자일 때의 메시지 반환
    }
}
