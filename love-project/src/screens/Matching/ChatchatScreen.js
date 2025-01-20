import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

const ChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { partner } = route.params; // 추천 리스트에서 선택된 사람의 정보
  const userID = partner.userUID; // 현재 사용자 ID (예: 로그인된 사용자 ID)
  const partnerID = "1"; // 선택된 파트너의 ID

  useEffect(() => {
    console.log("Selected partner data:", partner); // partner 데이터 확인용

    // WebSocket 연결 설정
    const newSocket = new WebSocket(`ws://192.168.1.23:8080/ws/chat?userUID=${userID}`);
    setSocket(newSocket);

      // WebSocket 메시지 수신 처리
      newSocket.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        console.log("Received message:", messageData);
  
        if (messageData.senderUID === partnerID || messageData.receiverUID === partnerID) {
                  const timestamp = messageData.timestamp
              ? new Date(messageData.timestamp)
              : new Date(); // timestamp가 없으면 현재 시간 사용
  
              const formattedMessage = {
                  _id: messageData.id || new Date().getTime(),
                  text: messageData.message,
                  createdAt: timestamp, // 유효한 timestamp를 사용
                  user: {
                      _id: messageData.senderUID,
                      name: messageData.senderUID === userID ? '나' : partner.userUID,
                  },
              };
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [formattedMessage])
          );
        };
      };

    // WebSocket 연결 상태 확인 후 로딩 종료
    newSocket.onopen = () => {
      console.log("WebSocket connection established.");
      setIsLoading(false);
    };

    // WebSocket 에러 핸들러 추가
    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLoading(false); // 연결 실패 시 로딩 종료
    };

    // WebSocket 연결 종료 처리
    return () => {
      if (newSocket && newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [userID, partnerID]);

  // WebSocket 연결 타임아웃 처리
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.error("WebSocket connection timeout.");
        setIsLoading(false);
      }
    }, 10000); // 10초 타임아웃

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const onSend = (newMessages = []) => {
    const message = newMessages[0];
    const messageToSend = {
      senderUID: userID,
      receiverUID: partnerID,
      content: message.text,
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(messageToSend));
      console.log("Message sent:", messageToSend);
    } else {
      console.error("WebSocket is not open. Message not sent.");
    }

    print("checking: ", newMessages);
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: userID,
        }}
        placeholder="메시지를 입력하세요..."
        alwaysShowSend
        renderUsernameOnMessage
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 채팅 화면 배경
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // 로딩 화면 배경
  },
});

export default ChatScreen;