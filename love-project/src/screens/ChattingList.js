import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { io } from 'socket.io-client'; // WebSocket 추가
import { v4 as uuidv4 } from 'uuid';

const Chattinglist = () => {
  const [chatList, setChatList] = useState([]);
  const [chatListWithInfo, setChatListWithInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const route = useRoute();
  const { userData } = route.params;

  const socket = io("http://192.168.1.11:8080"); // WebSocket 서버 주소

  // 채팅 목록을 불러오는 함수
  const loadChatList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://192.168.1.11:8088/api/messages/${userData.userUID}`);
      console.log("Messages from server:", response.data); // 서버 응답 로그 확인
      const messages = response.data;

      // 메시지 데이터를 시간 순으로 정렬 (sender, receiver 기준 없이)
      const sortedMessages = messages.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // 중복되는 채팅 목록을 제거하기 위한 Map 사용
      const chatMap = new Map();

      sortedMessages.forEach((message) => {
        const isSender = message.sender === userData.userUID;
        const partnerUID = isSender ? message.receiver : message.sender;

        if (!chatMap.has(partnerUID)) {
          chatMap.set(partnerUID, {
            partnerUID,
            lastMessage: message.content,
            lastTimestamp: message.timestamp,
            unreadCount: message.delivered === false ? 1 : 0,
          });
        } else {
          const existingChat = chatMap.get(partnerUID);
          if (new Date(message.timestamp) > new Date(existingChat.lastTimestamp)) {
            chatMap.set(partnerUID, {
              partnerUID,
              lastMessage: message.content,
              lastTimestamp: message.timestamp,
              unreadCount: message.delivered === false ? existingChat.unreadCount + 1 : existingChat.unreadCount,
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
    const handleNewMessage = (data) => {
      // console.log("Received new message:", data); // 새 메시지 로그 확인
      loadChatList(); // 새 메시지를 받은 후 채팅 목록 다시 로드
    };

    socket.on("newMessage", handleNewMessage);

    // 컴포넌트가 언마운트되거나 socket 변경 시 처리
    return () => {
      socket.off("newMessage", handleNewMessage); // 이벤트 리스너 해제
      socket.disconnect(); // 연결 해제
    };
  }, []); // socket 객체가 변경될 때마다 useEffect 호출

  useEffect(() => {
    const loadUserInfos = async () => {
      const updatedChatList = await Promise.all(
        chatList.map(async (chat) => {
          const formData = new FormData();
          formData.append("userUID", chat.partnerUID);

          const response = await axios.post("http://192.168.1.27:8080/users/findUserData", formData, { 
              headers: { "Content-Type": "multipart/form-data" }
          });

          return {partnerData: response.data.user, lastMessage: chat.lastMessage, lastTimestamp: chat.lastTimestamp};
        })
      );
      setChatListWithInfo(updatedChatList);
    };
  
    if (chatList.length > 0) {
      loadUserInfos();
    }
  }, [chatList]);

  // 채팅방을 클릭했을 때 이동
  const handleChatSelect = (partnerData) => {
    navigation.navigate("MatchingChatScreen", { chatlists: { userData, partnerData } });
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
      {chatListWithInfo.length > 0 ? (
        <FlatList
          data={chatListWithInfo}
          keyExtractor={(item) => `${item.partnerData.userUID}-${uuidv4()}`} // 고유 키 추가
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatItem} onPress={() => handleChatSelect(item.partnerData)}>
              <View style={styles.chatItemContent}>
                <Image
                  source={item.partnerData.profilePicture ? {uri: `http://192.168.1.27:8080/${item.partnerData.profilePicture}`} : require('../../assets/default-profile.png')}
                  style={[styles.profilePhoto]}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.partnerUID}>{item.partnerData.username}</Text>
                  <View style={styles.lastMessageContainer}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                    <Text style={styles.timestamp}>
                      {new Date(item.lastTimestamp).toLocaleString()}
                    </Text>
                  </View>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadCountContainer}>
                      <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
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
    display: "flex",
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginVertical: 5,
    elevation: 3,
  },
  chatItemContent: {
    flexDirection: 'row', // 이미지를 텍스트와 수평으로 배치
    alignItems: 'center',
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
  profilePhoto: {
    width: 60, 
    height: 60,
    borderRadius: 50, // 원형으로 만들기
    marginRight: 15, // 텍스트와 간격을 주기 위해
  },
  textContainer: {
    flex: 1, // 남는 공간을 텍스트가 차지하도록
  },
  unreadCountContainer: {
    position: 'absolute',
    top: 5,
    right: 15,
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
  },
});

export default Chattinglist;
