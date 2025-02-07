package com.example.love_chat.config;

import com.example.love_chat.model.Message;
import com.example.love_chat.service.MessageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final MessageService messageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public ChatWebSocketHandler(MessageService messageService) {
        this.messageService = messageService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userUID = getUserUID(session);
        if (userUID != null) {
            // 기존 세션이 있으면 제거 후 새 세션으로 갱신
            WebSocketSession existingSession = sessions.get(userUID);
            if (existingSession != null && existingSession.isOpen()) {
                existingSession.close(); // 기존 세션 닫기
            }
            sessions.put(userUID, session); // 새 세션으로 갱신

            System.out.println("사용자 " + userUID + " WebSocket 연결됨");

            // 사용자가 재접속 시 읽지 않은 메시지 전송
            List<Message> unreadMessages = messageService.getUnreadMessagesForUser(userUID);
            for (Message message : unreadMessages) {
                String responseMessage = objectMapper
                        .writeValueAsString(new ChatMessage(message.getSender(), message.getContent()));
                session.sendMessage(new TextMessage(responseMessage));
                messageService.markAsDelivered(message.getId()); // 메시지를 delivered로 처리
            }
        } else {
            session.sendMessage(new TextMessage("{\"error\": \"UserUID not provided\"}"));
            session.close();
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String senderUID = getUserUID(session);
        if (senderUID == null) {
            session.sendMessage(new TextMessage("{\"error\": \"User not authenticated\"}"));
            return;
        }

        String payload = message.getPayload();
        Map<String, Object> map = objectMapper.readValue(payload, Map.class);
        String recipientUID = (String) map.get("receiverUID");
        String chatMessage = (String) map.get("content");

        // 메시지 저장
        Message savedMessage = new Message();
        savedMessage.setSender(senderUID);
        savedMessage.setReceiver(recipientUID);
        savedMessage.setContent(chatMessage);
        savedMessage.setDelivered(false);
        messageService.saveMessage(savedMessage);

        // 수신자에게 메시지 전송
        WebSocketSession recipientSession = sessions.get(recipientUID);
        if (recipientSession != null) {
            if (recipientSession.isOpen()) {
                String responseMessage = objectMapper.writeValueAsString(new ChatMessage(senderUID, chatMessage));
                recipientSession.sendMessage(new TextMessage(responseMessage));
                messageService.markAsDelivered(savedMessage.getId());
            } else {
                sessions.remove(recipientUID); // 닫힌 세션 제거
            }
        } else {
            session.sendMessage(new TextMessage("{\"error\": \"Recipient is not connected\"}"));
        }

        // 발신자에게도 메시지 전송
        String responseMessage = objectMapper.writeValueAsString(new ChatMessage(senderUID, chatMessage));
        session.sendMessage(new TextMessage(responseMessage));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userUID = getUserUID(session);
        if (userUID != null && sessions.containsKey(userUID)) {
            sessions.remove(userUID);
            System.out.println("사용자 " + userUID + " WebSocket 연결 종료");
        }
    }

    private String getUserUID(WebSocketSession session) {
        try {
            return session.getUri().getQuery().split("=")[1];
        } catch (Exception e) {
            return null;
        }
    }

    // JSON 형식으로 반환할 메시지 객체
    public static class ChatMessage {
        private String senderUID;
        private String message;

        public ChatMessage(String senderUID, String message) {
            this.senderUID = senderUID;
            this.message = message;
        }

        public String getSenderUID() {
            return senderUID;
        }

        public String getMessage() {
            return message;
        }
    }
}
