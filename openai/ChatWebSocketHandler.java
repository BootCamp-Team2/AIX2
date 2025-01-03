import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.TextMessage;

import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.InputStream;
import java.util.concurrent.ConcurrentHashMap;

public class ChatWebSocketHandler extends TextWebSocketHandler {
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String username = session.getUri().getQuery();
        sessions.put(username, session);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userMessage = message.getPayload();
        
        // Python 서버에 요청
        String assistantResponse = sendToPythonServer(userMessage);

        // 사용자에게 응답 전송
        session.sendMessage(new TextMessage("나: " + userMessage));
        session.sendMessage(new TextMessage("어시스턴트: " + assistantResponse));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
        sessions.values().remove(session);
    }

    private String sendToPythonServer(String userMessage) throws Exception {
        URL url = new URL("http://localhost:5000/chat"); // Python 서버 URL
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setRequestProperty("Content-Type", "application/json");

        String jsonInputString = "{\"message\": \"" + userMessage + "\"}";

        // Python 서버에 데이터 전송
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonInputString.getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        // Python 서버로부터 응답 읽기
        try (InputStream is = conn.getInputStream()) {
            byte[] responseBytes = is.readAllBytes();
            return new String(responseBytes, "utf-8");
        }
    }
}
