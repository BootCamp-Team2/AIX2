package com.example.love_chat.config;

import com.example.love_chat.model.Message;
import com.example.love_chat.service.MessageService;
import com.fasterxml.jackson.databind.ObjectMapper; // JSON 변환을 위한 라이브러리
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.TextMessage;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final MessageService messageService;
    private final ObjectMapper objectMapper = new ObjectMapper(); // ObjectMapper 객체 생성

    @Autowired
    public ChatWebSocketHandler(MessageService messageService) {
        this.messageService = messageService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userUID = session.getUri().getQuery().split("=")[1]; // URL에서 userUID 추출
        if (userUID != null) {
            sessions.put(userUID, session);

            // 사용자가 연결되었을 때 읽지 않은 메시지를 전송
            List<Message> unreadMessages = messageService.getUnreadMessagesForUser(userUID);
            for (Message message : unreadMessages) {
                String responseMessage = objectMapper
                        .writeValueAsString(new ChatMessage(message.getSender(), message.getContent()));
                session.sendMessage(new TextMessage(responseMessage)); // 읽지 않은 메시지 전송
                messageService.markAsDelivered(message.getId()); // 메시지를 delivered로 처리
            }
        } else {
            session.sendMessage(new TextMessage("{\"error\": \"UserUID not provided\"}"));
            session.close();
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String senderUID = session.getUri().getQuery().split("=")[1]; // URL에서 userUID 추출
        if (senderUID == null) {
            session.sendMessage(new TextMessage("{\"error\": \"User not authenticated\"}"));
            return;
        }

        String payload = message.getPayload();
        ObjectMapper objectMapper = new ObjectMapper();

        // JSON 문자열을 Map으로 변환
        Map<String, Object> map = objectMapper.readValue(payload, Map.class);

        Object recipientUIDObj = map.get("receiverUID");
        String recipientUID = (recipientUIDObj != null) ? String.valueOf(recipientUIDObj) : null;
        String chatMessage = (String) map.get("content"); // 채팅 내용

        // 메시지 저장
        Message savedMessage = new Message();
        savedMessage.setSender(senderUID);
        savedMessage.setReceiver(recipientUID);
        savedMessage.setContent(chatMessage);
        savedMessage.setTimestamp(null); // DB에서 자동으로 시간 설정
        savedMessage.setDelivered(false); // 기본적으로 delivered는 false로 설정
        messageService.saveMessage(savedMessage); // 메시지 저장

        // 메시지가 수신자에게 전달되면 delivered를 true로 설정
        if (sessions.containsKey(recipientUID)) {
            WebSocketSession recipientSession = sessions.get(recipientUID);
            String responseMessage = objectMapper.writeValueAsString(new ChatMessage(senderUID, chatMessage));
            recipientSession.sendMessage(new TextMessage(responseMessage)); // 수신자에게 메시지 전송

            // 수신자에게 전달되었으므로 delivered 상태를 true로 업데이트
            messageService.markAsDelivered(savedMessage.getId()); // delivered 상태를 true로 업데이트
        } else {
            session.sendMessage(new TextMessage("{\"error\": \"Recipient is not connected\"}"));
        }

        // 발신자에게도 메시지 전송 (JSON 형식)
        String responseMessage = objectMapper.writeValueAsString(new ChatMessage(senderUID, chatMessage));
        session.sendMessage(new TextMessage(responseMessage)); // 발신자에게 메시지 전송
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
        String userUID = (String) session.getAttributes().get("userUID");
        if (userUID != null) {
            sessions.remove(userUID);
        }
    }

    // 채팅 메시지를 위한 inner class (JSON 형식으로 반환할 메시지 객체)
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