package com.example.love_chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.love_chat.model.Message;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // 수신자 기준으로 메시지 조회
    List<Message> findByReceiver(String receiver);

    // 발신자와 수신자 기준으로 메시지 조회
    List<Message> findBySenderAndReceiver(String sender, String receiver);

    // 발신자 또는 수신자 기준으로 메시지 조회 (양방향 메시지 처리)
    List<Message> findBySenderOrReceiver(String sender, String receiver);

    // 수신자와 delivered 상태를 기준으로 메시지 조회
    List<Message> findByReceiverAndDelivered(String receiver, boolean delivered);

    // delivered 상태로 필터링된 메시지를 수신자 기준으로 조회 (읽지 않은 메시지)
    List<Message> findByReceiverAndDeliveredFalse(String receiver); // 추가된 부분
}
