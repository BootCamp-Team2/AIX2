package com.example.love_chat.controller;

import com.example.love_chat.model.UserChatRecord;
import com.example.love_chat.service.ChatService;
import com.example.love_chat.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.MultiValueMap;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
public class ChatController {

    @Autowired
    private ChatService chatService; // ChatService 주입

    @Autowired
    private MessageService messageService; // MessageService 주입

    private static final String PYTHON_SERVER_URL = "http://127.0.0.1:5000/chat"; // Flask 서버 URL

    // 사용자 메시지를 받아서 Flask 서버와 통신하고, 응답 메시지를 반환하는 메서드
    @PostMapping
    public UserChatRecord sendMessage(@RequestBody UserChatRecord message) {
        // 사용자 메시지 저장 (ChatService, MessageService 두 군데에 저장)
        chatService.saveMessage(message);
        messageService.saveMessage(message); // MessageService로 메시지 저장

        // Flask 서버와 통신을 위한 RestTemplate 설정
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED); // 요청 헤더에 Content-Type 설정

        // Flask 서버에 전달할 메시지 데이터를 준비
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("content", message.getContent()); // 'content'로 메시지 본문 전달

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            // Flask 서버에 메시지 전송하고, AI 응답을 받음
            ResponseEntity<String> response = restTemplate.postForEntity(PYTHON_SERVER_URL, request, String.class);

            // Flask 서버의 응답에서 AI의 응답 메시지를 추출
            String aiResponse = response.getBody();

            // AI의 응답 메시지를 새로운 Message 객체에 담고 저장
            UserChatRecord aiMessage = new UserChatRecord();
            aiMessage.setContent(aiResponse); // AI 응답 설정
            aiMessage.setSender("AI"); // 응답 발신자 설정
            aiMessage.setReceiver("User"); // 응답 수신자 설정
            chatService.saveMessage(aiMessage); // 사용자 메시지와 함께 AI 메시지도 저장
            messageService.saveMessage(aiMessage); // MessageService에도 저장

            // AI의 응답 메시지를 반환
            return aiMessage;

        } catch (Exception e) {
            // Flask 서버와의 통신에 실패한 경우
            UserChatRecord errorMessage = new UserChatRecord();
            errorMessage.setContent("Error communicating with the chatbot server: " + e.getMessage());
            errorMessage.setSender("System"); // 오류 발생 시 발신자를 "System"으로 설정
            errorMessage.setReceiver("User"); // 오류 메시지 수신자 설정
            chatService.saveMessage(errorMessage); // 오류 메시지 저장
            return errorMessage; // 오류 메시지 반환
        }
    }

    // 사용자 이름을 통해 해당 사용자의 메시지 목록을 불러오는 메서드
    @GetMapping("/{username}")
    public List<UserChatRecord> getMessages(@PathVariable String username) {
        // 사용자의 메시지를 불러옴
        return chatService.getMessagesForUser(username);
    }
}
