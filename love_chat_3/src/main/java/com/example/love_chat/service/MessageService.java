package com.example.love_chat.service;

import com.example.love_chat.model.UserChatRecord;
import com.example.love_chat.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public UserChatRecord saveMessage(UserChatRecord message) {
        message.setTimestamp(java.time.LocalDateTime.now()); // 타임스탬프 설정
        return messageRepository.save(message); // 메시지 저장
    }

    public List<UserChatRecord> getMessagesForUser(String username) {
        return messageRepository.findByReceiver(username); // 특정 사용자의 메시지 조회
    }

    public List<UserChatRecord> getMessagesBetweenUsers(String sender, String receiver) {
        return messageRepository.findBySenderAndReceiver(sender, receiver); // 두 사용자 간 메시지 조회
    }
}
