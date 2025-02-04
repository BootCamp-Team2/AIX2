import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { io } from 'socket.io-client'; // WebSocket 추가
import { v4 as uuidv4 } from 'uuid';

const Chattinglist = () => {
  const [chatList, setChatList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const route = useRoute();
  const { userUID } = route.params;

  const socket = io("http://192.168.1.23:8088"); // WebSocket 서버 주소

  // 채팅 목록을 불러오는 함수
  const loadChatList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://192.168.1.23:8088/api/messages/${userUID}`);
      console.log("Messages from server:", response.data); // 서버 응답 로그 확인
      const messages = response.data;

      // 메시지 데이터를 시간 순으로 정렬 (sender, receiver 기준 없이)
      const sortedMessages = messages.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // 중복되는 채팅 목록을 제거하기 위한 Map 사용
      const chatMap = new Map();

      sortedMessages.forEach((message) => {
        const isSender = message.sender === userUID;
        const partnerUID = isSender ? message.receiver : message.sender;

        if (!chatMap.has(partnerUID)) {
          chatMap.set(partnerUID, {
            partnerUID,
            lastMessage: message.content,
            lastTimestamp: message.timestamp,
          });
        } else {
          const existingChat = chatMap.get(partnerUID);
          if (new Date(message.timestamp) > new Date(existingChat.lastTimestamp)) {
            chatMap.set(partnerUID, {
              partnerUID,
              lastMessage: message.content,
              lastTimestamp: message.timestamp,
            });
          }
        }
      });

      // 채팅 목록을 최신 메시지 순으로 정렬
      const validChats = Array.from(chatMap.values()).sort(
        (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
      );

      setChatList(validChats); // 채팅 목록 업데이트
    } catch (error) {
      console.error("Error loading chat list:", error);
      Alert.alert("오류", "채팅 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket을 통해 실시간 메시지 감지
  useEffect(() => {
    loadChatList(); // 초기 로드

    // 새로운 메시지가 오면 채팅 목록 업데이트
    socket.on("newMessage", (data) => {
      console.log("Received new message:", data); // 새 메시지 로그 확인
      loadChatList(); // 새 메시지를 받은 후 채팅 목록 다시 로드
    });

    return () => {
      socket.disconnect();
    };
  }, []); // useEffect는 컴포넌트가 마운트될 때 한 번만 호출됨

  // 채팅방을 클릭했을 때 이동
  const handleChatSelect = (partnerUID) => {
    navigation.navigate("MatchingChatScreen", { chatlists: { userUID, partnerUID } });
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
      {chatList.length > 0 ? (
        <FlatList
          data={chatList}
          keyExtractor={(item) => `${item.partnerUID}-${uuidv4()}`} // 고유 키 추가
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatItem} onPress={() => handleChatSelect(item.partnerUID)}>
              <Text style={styles.partnerUID}>{item.partnerUID}</Text>
              <View style={styles.lastMessageContainer}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
                <Text style={styles.timestamp}>
                  {new Date(item.lastTimestamp).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>채팅 목록이 없습니다.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatItem: {
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginVertical: 5,
    elevation: 3,
  },
  partnerUID: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333333",
  },
  lastMessageContainer: {
    marginTop: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666666",
  },
  timestamp: {
    marginTop: 3,
    fontSize: 12,
    color: "#aaaaaa",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888888",
    marginTop: 20,
  },
});

export default Chattinglist;
