package com.example.love_chat.service;

import com.example.love_chat.model.Message;
import com.example.love_chat.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    // 메시지를 저장하는 메서드
    public Message saveMessage(Message message) {
        message.setTimestamp(java.time.LocalDateTime.now()); // 타임스탬프 설정
        message.setDelivered(false); // 메시지가 처음 저장될 때 delivered 상태는 false
        return messageRepository.save(message); // 메시지 저장
    }

    // 특정 사용자가 받은 메시지들을 조회하는 메서드
    public List<Message> getMessagesForUser(String username) {
        return messageRepository.findByReceiver(username); // 특정 사용자가 받은 메시지 조회
    }

    // 두 사용자 간의 메시지를 조회하는 메서드
    public List<Message> getMessagesBetweenUsers(String sender, String receiver) {
        return messageRepository.findBySenderAndReceiver(sender, receiver); // 두 사용자 간 메시지 조회
    }

    // 사용자가 읽지 않은 메시지들을 조회하는 메서드
    public List<Message> getUnreadMessagesForUser(String userUID) {
        return messageRepository.findByReceiverAndDeliveredFalse(userUID); // 읽지 않은 메시지 조회
    }

    // 메시지를 읽음 처리 (delivered 상태를 true로 업데이트)
    public Message markAsDelivered(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setDelivered(true); // delivered 상태를 true로 설정
        return messageRepository.save(message); // 변경된 메시지를 저장
    }

    // 메시지를 발송자에게 전달하기 전에 delivered 상태를 false로 설정
    public void setMessageAsNotDelivered(Message message) {
        message.setDelivered(false); // 발송자에게 전달된 메시지는 delivered 상태가 false
        messageRepository.save(message);
    }
}
