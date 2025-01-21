package com.example.love_chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.love_chat.model.Message;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByReceiver(String receiver); // 수신자 기준으로 메시지 찾기
}
