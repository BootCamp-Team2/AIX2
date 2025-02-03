package com.example.love_chat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.love_chat.model.Message;
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
    public Message sendMessage(@RequestBody Message message) {
        return messageService.saveMessage(message);
    }

    /**
     * 특정 사용자의 모든 메시지 조회 API
     * 
     * @param userUID 사용자 ID
     * @return 해당 사용자의 모든 메시지 목록
     */
    @GetMapping("/{userUID}")
    public List<Message> getMessages(@PathVariable String userUID) {
        return messageService.getMessagesForUser(userUID);  // 사용자별 메시지 조회
    }

    /**
     * 1대1 채팅 메시지 조회 API
     * 
     * @param userUID      사용자 ID
     * @param recipientUID 상대방 ID
     * @return 두 사용자 간의 메시지 목록
     */
    @GetMapping("/{userUID}/chat/{recipientUID}")
    public List<Message> getChatMessages(
            @PathVariable String userUID,
            @PathVariable String recipientUID) {
        return messageService.getMessagesBetweenUsers(userUID, recipientUID);  // 1대1 채팅 메시지 조회
    }

    /**
     * 사용자가 읽지 않은 메시지 조회 API
     * 
     * @param userUID 사용자 ID
     * @return 읽지 않은 메시지 목록
     */
    @GetMapping("/{userUID}/unread")
    public List<Message> getUnreadMessages(@PathVariable String userUID) {
        return messageService.getUnreadMessagesForUser(userUID);  // 읽지 않은 메시지 조회
    }

    /**
     * 메시지 읽음 처리 API (delivered 상태 변경)
     * 
     * @param messageId 메시지 ID
     * @return 업데이트된 메시지
     */
    @PutMapping("/markAsDelivered/{messageId}")
    public Message markAsDelivered(@PathVariable Long messageId) {
        return messageService.markAsDelivered(messageId);  // 메시지 읽음 처리
    }
}
