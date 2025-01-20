// WebSocketHandshakeInterceptor.java
package com.example.love_chat.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // userUID를 추출하여 세션 속성에 저장
        String userUID = request.getURI().getQuery();
        if (userUID != null && userUID.startsWith("userUID=")) {
            userUID = userUID.split("=")[1];
            attributes.put("userUID", userUID);
            return true;
        }
        return false; // userUID가 없으면 핸드셰이크를 거부
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Exception exception) {
    }
}
