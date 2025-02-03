import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const giftChatRef = useRef();

  const [userID, setUserID] = useState('');
  const [partnerID, setPartnerID] = useState('');

  const { partner, chatlists } = route.params;

  useEffect(() => {
    if (partner) {
      setUserID("9980593714"); // 현재 사용자 ID
      setPartnerID(partner.userUID); // 선택된 파트너의 ID
    } else if (chatlists) {
      setUserID(chatlists.userUID);
      setPartnerID(chatlists.partnerUID);
    }
  }, [partner, chatlists]);

  // 채팅 기록 로컬 저장소에서 불러오기
  const loadMessagesFromStorage = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem(`chat_${userID}_${partnerID}`);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error("Error loading messages from AsyncStorage:", error);
    }
  };

  // 메시지 불러오기
  const onLoadMessages = async () => {
    try {
      const response = await axios.get("http://192.168.1.3:3000/get-chat", {
        params: { userUID: userID, partnerUID: partnerID }
      });

      if (response.data && response.data.messages) {
        const formattedMessages = response.data.messages.map(message => ({
          _id: message.id || new Date().getTime(), // id가 없으면 새로운 고유값 할당
          text: message.content,
          createdAt: new Date(message.timestamp),
          user: {
            _id: message.senderUID,
            name: message.senderUID === userID ? '나' : partner.userUID,
          },
          delivered: message.delivered,
        }));

        setMessages(formattedMessages);
        await AsyncStorage.setItem(`chat_${userID}_${partnerID}`, JSON.stringify(formattedMessages));
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  useEffect(() => {
    loadMessagesFromStorage();

    const newSocket = new WebSocket(`ws://192.168.1.23:8088/ws/chat?userUID=${userID}`);
    setSocket(newSocket);

    newSocket.onmessage = async (event) => {
      const messageData = JSON.parse(event.data);
      console.log("Received message:", messageData);

      if (messageData.senderUID === partnerID || messageData.receiverUID === partnerID) {
        const timestamp = messageData.timestamp ? new Date(messageData.timestamp) : new Date();

        const formattedMessage = {
          _id: messageData.id || new Date().getTime(),
          text: messageData.message,
          createdAt: timestamp,
          user: {
            _id: messageData.senderUID,
            name: messageData.senderUID === userID ? '나' : partnerID,
          },
          delivered: messageData.delivered,
        };

        setMessages((previousMessages) => {
          const updatedMessages = GiftedChat.append(previousMessages, [formattedMessage]);

          try {
            AsyncStorage.setItem(`chat_${userID}_${partnerID}`, JSON.stringify(updatedMessages));
          } catch (error) {
            console.error("Error saving message to AsyncStorage:", error);
          }

          return updatedMessages;
        });
      }
    };

    newSocket.onopen = () => {
      console.log("WebSocket connection established.");
      setIsLoading(false);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLoading(false);
    };

    return () => {
      if (newSocket && newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [userID, partnerID]);

  const onSend = async (newMessages = []) => {
    const message = newMessages[0];
    const messageToSend = {
      senderUID: userID,
      receiverUID: partnerID,
      content: message.text,
      delivered: false,
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(messageToSend)); // WebSocket을 통해 메시지 전송
      console.log("Message sent:", messageToSend);
    } else {
      console.error("WebSocket is not open. Message not sent.");
    }

    setMessages((previousMessages) => {
      const updatedMessages = GiftedChat.append(previousMessages, newMessages);

      try {
        AsyncStorage.setItem(`chat_${userID}_${partnerID}`, JSON.stringify(updatedMessages));
      } catch (error) {
        console.error("Error saving message to AsyncStorage:", error);
      }

      return updatedMessages;
    });
  };

  useEffect(() => {
    if (giftChatRef.current) {
      giftChatRef.current.scrollToBottom();
    }
  }, [messages]);

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
        ref={giftChatRef}  // ref 사용
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: userID,
        }}
        placeholder="메시지를 입력하세요..."
        alwaysShowSend
        renderUsernameOnMessage
        inverted={true} // 메시지가 위에서 아래로 내려가도록 설정
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default ChatScreen;
