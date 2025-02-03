package com.example.love_chat.config;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.listener.DataListener;
import com.example.love_chat.model.Message;  // 여러분의 Message 클래스
import com.example.love_chat.service.MessageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration; // Spring의 @Configuration
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final MessageService messageService;

    // @Lazy 어노테이션을 사용하여 SocketIOServer의 의존성 주입을 지연시킴
    private final SocketIOServer socketIOServer;

    // 생성자: MessageService를 주입받습니다.
    @Autowired
    public WebSocketConfig(MessageService messageService, @Lazy SocketIOServer socketIOServer) {
        this.messageService = messageService;
        this.socketIOServer = socketIOServer;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // "/ws/chat" 엔드포인트에 WebSocket 핸들러 등록
        registry.addHandler(chatWebSocketHandler(), "/ws/chat")
                .setAllowedOrigins("*") // 모든 origin 허용 (프로덕션에서는 제한 필요)
                .addInterceptors(new HttpSessionHandshakeInterceptor());
    }

    @Bean
    public ChatWebSocketHandler chatWebSocketHandler() {
        // MessageService를 주입한 ChatWebSocketHandler 인스턴스 반환
        return new ChatWebSocketHandler(messageService);
    }

    // Socket.IO 서버를 설정하는 Bean
    @Bean
    public SocketIOServer socketIOServer() {
        // Socket.IO의 Configuration은 풀 패키지 이름을 사용하여 충돌을 피합니다.
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname("192.168.1.23");  // 서버의 IP 주소 설정
        config.setPort(8080);                // 포트 설정

        SocketIOServer server = new SocketIOServer(config);

        // 새로운 메시지를 받을 리스너 추가
        server.addEventListener("newMessage", Message.class, new DataListener<Message>() {
            @Override
            public void onData(SocketIOClient client, Message data, AckRequest ackRequest) {
                System.out.println("Received new message: " + data);
                // 모든 클라이언트에게 메시지 브로드캐스트
                server.getBroadcastOperations().sendEvent("newMessage", data);
            }
        });

        // 서버 시작
        server.start();
        return server;
    }
}
