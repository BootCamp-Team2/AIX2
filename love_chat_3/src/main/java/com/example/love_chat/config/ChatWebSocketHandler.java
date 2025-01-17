package com.example.love_chat.config;

import com.example.love_chat.model.Message;
import com.example.love_chat.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.TextMessage;

import java.util.concurrent.ConcurrentHashMap;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Autowired
    private MessageService messageService; // 메시지를 DB에 저장하는 서비스

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userUID = (String) session.getAttributes().get("userUID");
        if (userUID != null) {
            sessions.put(userUID, session);
        } else {
            session.close();
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String senderUID = (String) session.getAttributes().get("userUID");
        if (senderUID == null) {
            session.sendMessage(new TextMessage("Error: User not authenticated"));
            return;
        }

        String payload = message.getPayload();
        String[] parts = payload.split(":", 2);
        String recipientUID = parts[0]; // 수신자의 userUID
        String chatMessage = parts[1]; // 채팅 내용

        // 메시지 저장
        Message savedMessage = new Message();
        savedMessage.setSender(senderUID);
        savedMessage.setReceiver(recipientUID);
        savedMessage.setContent(chatMessage);
        savedMessage.setTimestamp(null); // DB에서 자동으로 시간 설정

        // 메시지 저장
        messageService.saveMessage(savedMessage);

        // 메시지를 수신자에게 전송
        if (sessions.containsKey(recipientUID)) {
            WebSocketSession recipientSession = sessions.get(recipientUID);
            recipientSession.sendMessage(new TextMessage("상대방: " + chatMessage));
        } else {
            session.sendMessage(new TextMessage("Error: Recipient is not connected"));
        }

        // 발신자에게 전송
        session.sendMessage(new TextMessage("나: " + chatMessage));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
        sessions.values().remove(session);
    }
}
