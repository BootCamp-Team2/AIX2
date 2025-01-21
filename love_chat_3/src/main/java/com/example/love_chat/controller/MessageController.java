package com.example.love_chat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.love_chat.model.UserChatRecord;
import com.example.love_chat.service.MessageService;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    /**
     * 메시지 전송 API
     * 
     * @param message 전송할 메시지 객체
     * @return 저장된 메시지
     */
    @PostMapping
    public UserChatRecord sendMessage(@RequestBody UserChatRecord message) {
        // 메시지 저장
        return messageService.saveMessage(message);
    }

    /**
     * 특정 사용자의 모든 메시지 조회 API
     * 
     * @param userUID 사용자 ID
     * @return 해당 사용자의 모든 메시지 목록
     */
    @GetMapping("/{userUID}")
    public List<UserChatRecord> getMessages(@PathVariable String userUID) {
        // 해당 사용자의 메시지 목록 반환
        return messageService.getMessagesForUser(userUID);
    }

    /**
     * 1대1 채팅 메시지 조회 API
     * 
     * @param userUID      사용자 ID
     * @param recipientUID 상대방 ID
     * @return 두 사용자 간의 메시지 목록
     */
    @GetMapping("/{userUID}/chat/{recipientUID}")
    public List<UserChatRecord> getChatMessages(
            @PathVariable String userUID,
            @PathVariable String recipientUID) {
        // 두 사용자 간의 메시지 반환
        return messageService.getMessagesBetweenUsers(userUID, recipientUID);
    }
}
