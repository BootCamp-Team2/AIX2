import React, { useState, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';

const ChatAI = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 초기 메시지 설정
    setMessages([
      {
        _id: 1,
        text: '안녕하세요! 채팅을 시작해보세요.',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: '상대방',
        },
      },
    ]);
  }, []);

  const onSend = (newMessages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{
        _id: 1, // 현재 사용자 ID
      }}
    />
  );
};

export default ChatAI;
