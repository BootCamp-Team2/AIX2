package com.example.love_chat.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.io.Serializable; // Serializable 추가

@Entity
public class Message implements Serializable {  // Serializable 구현

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sender;

    @Column(nullable = false)
    private String receiver;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private boolean delivered;  // 메시지가 전달되었는지 여부를 추적하는 필드

    // 기본 생성자 추가
    public Message() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getReceiver() {
        return receiver;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isDelivered() {
        return delivered;
    }

    public void setDelivered(boolean delivered) {
        this.delivered = delivered;
    }

    // 자동으로 timestamp 값을 설정하는 메서드
    @PrePersist
    public void prePersist() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    @Override
    public String toString() {
        return "Message{sender='" + sender + "', receiver='" + receiver + "', content='" + content + "', timestamp=" + timestamp + ", delivered=" + delivered + "}";
    }
}
