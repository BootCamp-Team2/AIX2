import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트

const ChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { partner } = route.params; // 추천 리스트에서 선택된 사람의 정보
  const userID = partner.userUID; // 현재 사용자 ID (예: 로그인된 사용자 ID)
  const partnerID = "1"; // 선택된 파트너의 ID

  // 채팅 기록 로컬 저장소에서 불러오기
  const loadMessagesFromStorage = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem(`chat_${userID}_${partnerID}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages)); // 로컬 저장소에서 메시지를 불러와 상태에 설정
      }
    } catch (error) {
      console.error("Error loading messages from AsyncStorage:", error);
    }
  };

  // 메시지 불러오기
  const onLoadMessages = async () => {
    try {
      const response = await axios.get("http://192.168.1.35:3000/get-chat", {
        params: { userUID: userID, partnerUID: partnerID }
      });

      if (response.data && response.data.messages) {
        const formattedMessages = response.data.messages.map(message => ({
          _id: message.id,
          text: message.content,
          createdAt: new Date(message.timestamp),
          user: {
            _id: message.senderUID,
            name: message.senderUID === userID ? '나' : partner.userUID,
          },
          delivered: message.delivered, // delivered 상태도 포함
        }));

        setMessages(formattedMessages); // 이전 메시지를 상태에 설정
        // 로컬 저장소에 저장
        await AsyncStorage.setItem(`chat_${userID}_${partnerID}`, JSON.stringify(formattedMessages));
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  useEffect(() => {
    console.log("Selected partner data:", partner); // partner 데이터 확인용

    // 이전 채팅 기록 불러오기
    loadMessagesFromStorage();

    // WebSocket 연결 설정
    const newSocket = new WebSocket(`ws://192.168.1.23:8080/ws/chat?userUID=${userID}`);
    setSocket(newSocket);

    // WebSocket 메시지 수신 처리
    newSocket.onmessage = async (event) => {
      const messageData = JSON.parse(event.data);
      console.log("Received message:", messageData);

      // 메시지가 partner와 관련된 메시지라면 GiftedChat에 추가
      if (messageData.senderUID === partnerID || messageData.receiverUID === partnerID) {
        const timestamp = messageData.timestamp ? new Date(messageData.timestamp) : new Date(); // timestamp가 없으면 현재 시간 사용

        const formattedMessage = {
          _id: messageData.id || new Date().getTime(),
          text: messageData.message,
          createdAt: timestamp, // 유효한 timestamp를 사용
          user: {
            _id: messageData.senderUID,
            name: messageData.senderUID === userID ? '나' : partner.userUID,
          },
          delivered: messageData.delivered, // delivered 상태 포함
        };

        setMessages((previousMessages) => {
          const updatedMessages = GiftedChat.append(previousMessages, [formattedMessage]);
        
          // 새로운 메시지가 도착할 때마다 로컬에 저장
          try {
            AsyncStorage.setItem(`chat_${userID}_${partnerID}`, JSON.stringify(updatedMessages));
          } catch (error) {
            console.error("Error saving message to AsyncStorage:", error);
          }
        
          return updatedMessages;
        });
        
      }
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

  const onSend = async (newMessages = []) => {
    const message = newMessages[0];
    const messageToSend = {
      senderUID: userID,
      receiverUID: partnerID,
      content: message.text,
      delivered: false, // 메시지가 아직 전달되지 않았음을 표시
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(messageToSend)); // WebSocket을 통해 메시지 전송
      console.log("Message sent:", messageToSend);
    } else {
      console.error("WebSocket is not open. Message not sent.");
    }

    setMessages((previousMessages) => {
      const updatedMessages = GiftedChat.append(previousMessages, newMessages); // 기존 메시지와 새로운 메시지 합치기
  
      // 로컬 저장소에 새로운 메시지를 저장
      try {
        AsyncStorage.setItem(`chat_${userID}_${partnerID}`, JSON.stringify(updatedMessages)); // 메시지 저장
      } catch (error) {
        console.error("Error saving message to AsyncStorage:", error);
      }
  
      return updatedMessages; // 새로 추가된 메시지 포함된 상태를 반환
    });

    // 메시지를 로컬에 저장
    await AsyncStorage.setItem(`chat_${userID}_${partnerID}`, JSON.stringify([...messages, ...newMessages]));
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