import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Modal, Alert, Easing, TouchableOpacity, Animated, Image, Text, StyleSheet, View, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GiftedChat, Bubble, InputToolbar, Send, Time, Avatar, renderSystemMessage } from 'react-native-gifted-chat';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트
import Icon from 'react-native-vector-icons/MaterialIcons';
import Font from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from "@expo/vector-icons";

// 한국어 텍스트 감정 분석 함수
const analysisConversation = async (username, chatData) => {
  console.log(chatData);

  const copyChatData = [...chatData];
  const formData = new FormData();
  formData.append("myName", username);
  formData.append("messages", JSON.stringify(copyChatData.reverse()));

  const response = await axios.post("http://192.168.1.27:4000/chat/analysis", formData, {
    headers: {"Content-Type": "multipart/formdata"}
  });

  if(response && response.data && response.data.analysis)
    return JSON.parse(response.data.analysis);
  else
    return null;
};

const MatchingChatScreen = ({ route }) => {
    const navigation = useNavigation(); // 화면 전환에 사용
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null); // WebSocket 상태 관리
    const [isLoading, setIsLoading] = useState(true);
    const giftChatRef = useRef();

    const [affectionScore, setAffectionScore] = useState(0); // 첫 호감도 점수 0점 세팅
    const [liked, setLiked] = useState(false); //UI
    const scaleValue = new Animated.Value(1); //UI
    const [text, setText] = useState(''); // 입력값 상태 추가
  
    const [userData, setUserData] = useState({});
    const [partnerData, setPartnerData] = useState({});

    const [messagesCount, setMessagesCount] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');
  
    const { partner, chatlists } = route.params;
    useEffect(() => {
      const loadChatInit = async () => {
        if (partner) {
          setUserData(JSON.parse(await AsyncStorage.getItem("userData"))); // 현재 사용자 ID
          setPartnerData(partner); // 선택된 파트너의 ID
        } else if (chatlists) {
          setUserData(chatlists.userData);
          setPartnerData(chatlists.partnerData);
        }
      };
  
      loadChatInit();
    }, [partner, chatlists]);

    useEffect(() => {
      const loadAffectScore = async () => {
        if (userData && partnerData) {
          const affect = await AsyncStorage.getItem(`chat_${userData.userUID}_${partnerData.userUID}_percentage`);
          setAffectionScore(affect ? Number(affect) : 0);
        }
      };

      loadAffectScore();
    }, [userData, partnerData]);
  
    // 채팅 기록 로컬 저장소에서 불러오기
    const loadMessagesFromStorage = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem(`chat_${userData.userUID}_${partnerData.userUID}`);
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error("Error loading messages from AsyncStorage:", error);
      }
    };
  
    useEffect(() => {
      loadMessagesFromStorage();

      if(!userData?.userUID || !partnerData?.userUID) return;
      if(socketRef.current) return;
  
      const newSocket = new WebSocket(`ws://192.168.1.11:8088/ws/chat?userUID=${userData.userUID}`);
      // console.log(newSocket);
      socketRef.current = newSocket;
      setSocket(newSocket);
  
      newSocket.onmessage = async (event) => {
        const messageData = JSON.parse(event.data);
        // console.log("Received message:", messageData);
  
        if (messageData.senderUID === partnerData.userUID || messageData.receiverUID === partnerData.userUID) {
          const timestamp = messageData.timestamp ? new Date(messageData.timestamp) : new Date();
  
          const formattedMessage = {
            _id: messageData.id || new Date().getTime(),
            text: messageData.message,
            createdAt: timestamp,
            user: {
              _id: messageData.senderUID,
              name: messageData.senderUID === userData.userUID ? userData.username : partnerData.username,
              avatar: messageData.senderUID === userData.userUID ? `http://192.168.1.27:8080/${userData.profilePicture}` : `http://192.168.1.27:8080/${partnerData.profilePicture}`
            },
            delivered: messageData.delivered,
          };
  
          setMessages((previousMessages) => {
            const updatedMessages = GiftedChat.append(previousMessages, [formattedMessage]);
  
            try {
              AsyncStorage.setItem(`chat_${userData.userUID}_${partnerData.userUID}`, JSON.stringify(updatedMessages));
            } catch (error) {
              console.error("Error saving message to AsyncStorage:", error);
            }
  
            return updatedMessages;
          });

          setMessagesCount(prevCount => prevCount + 1);
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

      // newSocket.onclose = () => {
      //   console.log("WebSocket closed. Attempting to reconnect...");
      //   setTimeout(() => {
      //     setSocket(new WebSocket(`ws://192.168.1.11:8088/ws/chat?userUID=${userData.userUID}`));
      //   }, 5000); // 5초 후 재연결 시도
      // };
  
      return () => {
        if(socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    }, [userData, partnerData]);
  
    const onSend = async (newMessages = []) => {
      const message = newMessages[0];
      const messageToSend = {
        senderUID: userData.userUID,
        receiverUID: partnerData.userUID,
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
          AsyncStorage.setItem(`chat_${userData.userUID}_${partnerData.userUID}`, JSON.stringify(updatedMessages));
        } catch (error) {
          console.error("Error saving message to AsyncStorage:", error);
        }
  
        return updatedMessages;
      });

      setMessagesCount(prevCount => prevCount + 1);
    };
  
    useEffect(() => {
      if (giftChatRef.current) {
        giftChatRef.current.scrollToBottom();
      }
    }, [messages]);

    useEffect(() => {
      const responseConversationAPI = async () => {
        if(messagesCount >= 5) {
          setMessagesCount(0);
  
          const analysisData = await analysisConversation(userData.username, messages);
          // console.log(analysisData);
  
          if(analysisData) {
            const announcementMessage = {
              _id: Math.random().toString(36).substring(7),
              text: "❤️ 대화내용을 분석했어요~! ( 클릭!! )",
              createAt: new Date(),
              system: true,
              isAnnouncement: true,
              data: analysisData,
            };
  
            setMessages((prevMessages) => {
              const updatedMessages = GiftedChat.append(prevMessages, [announcementMessage]);
    
              try {
                AsyncStorage.setItem(`chat_${userData.userUID}_${partnerData.userUID}`, JSON.stringify(updatedMessages));
              } catch (error) {
                console.error("Error saving message to AsyncStorage:", error);
              }
        
              return updatedMessages;
            });
  
            setAffectionScore(analysisData.score);
            AsyncStorage.setItem(`chat_${userData.userUID}_${partnerData.userUID}_percentage`, String(analysisData.score));
          }
        }
      }

      responseConversationAPI();
    }, [messagesCount]);
  
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      );
    }

    const handleSystemMessagePress = (data) => {
      setSelectedMessage(JSON.parse(data));
      setModalVisible(true);
    };

    const renderSystemMessage = (props) => {
      const { currentMessage } = props;

      return (
        <TouchableOpacity onPress={() => handleSystemMessagePress(JSON.stringify(currentMessage.data))}>
          <View style={styles.announcementContainer}>
            <Text style={styles.announcementText}>{currentMessage.text}</Text>
          </View>
        </TouchableOpacity>
      );
    }
  
   // 말풍선 스타일 커스터마이징
   const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#FF9AAB', // 오른쪽 말풍선 색상          
          },
          left: {
            backgroundColor: '#FF9AAB', // 왼쪽 말풍선 색상         
          },
        }}
        textStyle={{
          right: {
            color: 'white', // 오른쪽 텍스트 색상
          },
          left: {
            color: 'white', // 왼쪽 텍스트 색상
          },
        }}
      />
    );
  };
  
  // 입력창 스타일 커스터마이징
  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: '#fff', // 입력창 배경색
          borderColor: '#FF9AAB', // 입력창 상단 테두리 색상
          borderWidth: 2,
          borderRadius: 7,
          marginHorizontal: 7,
          marginBottom: 3.5,
        }}
      />
    );
  };
  
  // 전송 버튼 스타일 커스터마이징
  const renderSend = (props) => {
    return (
      <Send
        {...props}
        containerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}
      >
        <Icon name="send" size={28} color="#FF9AAB" />
      </Send>
    );
  };
  
  // 사용자 아바타 커스터마이징
  const renderAvatar = (props) => {
    return (
      <Avatar
        {...props}
        imageStyle={{
          left: { width: 50, height: 50, borderRadius: 20 }, // 왼쪽 아바타 스타일
          right: { width: 50, height: 50, borderRadius: 20 }, // 오른쪽 아바타 스타일
        }}
      />
    );
  };
  
  // 메시지 시간 표시 커스터마이징
  const renderTime = (props) => {
    return (
      <Time
        {...props}
        timeTextStyle={{
          left: { color: 'white', fontSize: 12 }, // 왼쪽 시간 텍스트 스타일
          right: { color: 'white', fontSize: 12 }, // 오른쪽 시간 텍스트 스타일
        }}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.matching}>
      <View >
        <Image source={partnerData.profilePicture ? {uri: `http://192.168.1.27:8080/${partnerData.profilePicture}`} : require('../../../assets/default-profile.png')} 
                style={{width : 60, 
                        height : 60,
                        borderRadius: 30,
                        marginRight: 7,
                        marginLeft: 7,
                        }}
        />
      </View>
      
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Font style={styles.heart}                    
        name={liked ? 'heart' : 'heart-o'} 
        size={30} 
        color={liked ? 'red' : 'black'} 
        />
      </Animated.View>
          
      <View>
        <Image source={userData.profilePicture ? {uri: `http://192.168.1.27:8080/${userData.profilePicture}`} : require('../../../assets/default-profile.png')} 
            style={{width : 60, 
                    height : 60,
                    borderRadius: 30,
                    marginRight: 7,
                    marginLeft: 7,
                    }}
        />                       
      </View>
    </View>  

    <View>
        {/* 호감도 점수 표시 */}
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>호감도 점수 : {affectionScore}점</Text>
          <View style={styles.gaugeBarBox}>
            <View
              style={[
                styles.gaugeBar,
                { width: `${affectionScore}%` }, // 점수에 따라 너비 조정
              ]}
            />
          </View>
        </View>
      </View> 
            
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? -300 : -268} // ios 조정 확인 필요
      >
        <GiftedChat
          messages={messages}
          onSend={newMessages => onSend(newMessages)}
          user={{
              _id: userData.userUID,
              name: userData.username,
              avatar: `http://192.168.1.27:8080/${userData.profilePicture}`,
          }}
          textInputProps={{
            placeholder: '메시지를 입력하세요...',
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          renderAvatar={renderAvatar}
          renderTime={renderTime}
          renderSystemMessage={renderSystemMessage}
          onPressAvatar={() => navigation.navigate('OpProfileScreen', { userData: partnerData })}
          alwaysShowSend
        />
      </KeyboardAvoidingView>
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 타이틀 */}
            <View style={styles.header}>
              <Ionicons name="chatbubbles-outline" size={24} color="#FF6B6B" />
              <Text style={styles.modalTitle}>대화 분석 결과</Text>
            </View>

            {/* 분석 내용 */}
            <View style={styles.content}>
              <Text style={styles.label}>📊 평가점수</Text>
              <Text style={styles.value}>{selectedMessage.score}</Text>

              <Text style={styles.label}>💬 중심 대화내용</Text>
              <Text style={styles.value}>{selectedMessage.key_conversation}</Text>

              <Text style={styles.label}>🔍 이유</Text>
              <Text style={styles.value}>{selectedMessage.reason}</Text>

              <Text style={styles.label}>✨ 피드백</Text>
              <Text style={styles.value}>{selectedMessage.recommendation}</Text>
            </View>

            {/* 닫기 버튼 */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
  };
  
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    paddingTop: 5,
  },
  matching: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  heart: {
    color: '#FF9AAB',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 7,
    marginLeft: 7,
  },
  scoreBox: {
    backgroundColor: '#fff',
    height: 65,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  gaugeBarBox: {
    width: '95%',
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 7,
    overflow: 'hidden',
  },
  gaugeBar: {
    height: 30,
    backgroundColor: '#FF9AAB',
    borderRadius: 5,
  },
  announcementContainer: {
    padding: 5,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 5,
  },
  announcementText: {
    color: 'gray',
    textAlign: 'center',
    fontSize: 12,
    textDecorationLine: "underline"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#FF6B6B",
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    color: "#333",
    textDecorationLine: "underline"
  },
  value: {
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
    color: "#555",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#FF9AAB",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default MatchingChatScreen;