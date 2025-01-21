package com.example.love_chat.config;

import com.example.love_chat.service.MessageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final MessageService messageService;

    // Constructor to inject MessageService
    public WebSocketConfig(MessageService messageService) {
        this.messageService = messageService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register the WebSocket handler with the "/ws/chat" endpoint
        registry.addHandler(chatWebSocketHandler(), "/ws/chat")
                .setAllowedOrigins("*") // Allow all origins, adjust as needed for production
                .addInterceptors(new HttpSessionHandshakeInterceptor());
    }

    @Bean
    public ChatWebSocketHandler chatWebSocketHandler() {
        // Return a new instance of ChatWebSocketHandler with the injected
        // MessageService
        return new ChatWebSocketHandler(messageService);
    }
}
