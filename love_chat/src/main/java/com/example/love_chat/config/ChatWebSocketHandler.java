package com.example.love_chat.config;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.TextMessage;
import java.util.concurrent.ConcurrentHashMap;

public class ChatWebSocketHandler extends TextWebSocketHandler {
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String username = session.getUri().getQuery(); // URL에 포함된 사용자 이름
        sessions.put(username, session);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        String[] parts = payload.split(":", 2);
        String recipient = parts[0];
        String chatMessage = parts[1];

        if (sessions.containsKey(recipient)) {
            WebSocketSession recipientSession = sessions.get(recipient);
            recipientSession.sendMessage(new TextMessage("상대방: " + chatMessage));
        }
        session.sendMessage(new TextMessage("나: " + chatMessage));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
        sessions.values().remove(session);
    }
}
