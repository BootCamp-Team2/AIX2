import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Easing, TouchableOpacity, Animated, Image, Text, StyleSheet, View, ActivityIndicator} from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send, Time, Avatar } from 'react-native-gifted-chat';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트
import Icon from 'react-native-vector-icons/MaterialIcons';
import Font from 'react-native-vector-icons/FontAwesome';

// 한국어 감정 사전
const koreanSentimentDict = {
  좋아: 2, 매력:2, 긍정:1, 칭찬:1, 재밌어요:1, 웃겨요:1, 
  사랑: 3,
  행복: 2,
  최고: 3,
  싫어: -2,
  화남: -3,
  슬퍼: -2,
  최악: -3,
};

// 한국어 텍스트 감정 분석 함수
const analyzeKoreanSentiment = (text) => {
  let score = 0;
  for (const word in koreanSentimentDict) {
    if (text.includes(word)) {
      score += koreanSentimentDict[word];
    }
  }
  return score;
};

const MatchingChatScreen = ({ route }) => {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const giftChatRef = useRef();

    const [affectionScore, setAffectionScore] = useState(36.5); // 첫 호감도 점수: 36.5
    const [liked, setLiked] = useState(false); //UI
    const scaleValue = new Animated.Value(1); //UI
    const [text, setText] = useState(''); // 입력값 상태 추가
  
    const [userData, setUserData] = useState({});
    const [partnerData, setPartnerData] = useState({});
  
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
  
    // 메시지 불러오기
    const onLoadMessages = async () => {
      try {
        const response = await axios.get("http://192.168.1.27:3000/get-chat", {
          params: { userUID: userID, partnerUID: partnerID }
        });
  
        if (response.data && response.data.messages) {
          const formattedMessages = response.data.messages.map(message => ({
            _id: message.id,
            text: message.content,
            createdAt: new Date(message.timestamp),
            user: {
              _id: message.senderUID,
              name: message.senderUID === userID ? '나' : "1",
            },
            delivered: message.delivered, // delivered 상태도 포함
          }));
  
          setMessages(formattedMessages); // 이전 메시지를 상태에 설정
          // 로컬 저장소에 저장
          await AsyncStorage.setItem(`chat_${userID}_${userID}`, JSON.stringify(formattedMessages));
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };
  
    useEffect(() => {
      loadMessagesFromStorage();
  
      const newSocket = new WebSocket(`ws://192.168.1.11:8088/ws/chat?userUID=${userData.userUID}`);
      // console.log(newSocket);
      setSocket(newSocket);
  
      newSocket.onmessage = async (event) => {
        const messageData = JSON.parse(event.data);
        // console.log("Received message:", messageData);

        const score = analyzeKoreanSentiment(messageData.message)
        setAffectionScore((prevScore) => {
          const newScore = prevScore + score;
          return Math.max(0, Math.min(100, newScore));
        });
  
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
  <View style={styles.container}>
    
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
        <Text style={styles.scoreText}>상대방 호감도 : {affectionScore}%</Text>
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
  
  
      <GiftedChat
        messages={messages}
        onSend={newMessages => onSend(newMessages)}
        user={{
          _id: userData.userUID, // 사용자 ID
          name: userData.username, // 사용자 이름
          avatar: `http://192.168.1.27:8080/${userData.profilePicture}`, // 사용자 아바타 URL
        }}
        textInputProps={{
          placeholder: '메시지를 입력하세요...', // 원하는 텍스트로 변경
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderAvatar={renderAvatar}
        renderTime={renderTime}
        alwaysShowSend
      />
  </View>
  );
  };
  
  // 스타일 정의
  const styles = StyleSheet.create({    
    container: {
      flex: 1,
      backgroundColor: '#fff', // 채팅 화면 배경
    }, 
  matching:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },  
  heart: {
      color : '#FF9AAB',
  },  
  heartText: {
      fontSize:21,
      color : '#FF9AAB', 
      width: '80%',
      height: 75, 
      alignItems: 'center', 
      textAlign:'center', 
      alignSelf: 'center',
  }, 
    scoreBox: {
    backgroundColor: '#fff',
    height: 65,
    textAlign:'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign:'center',
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
  });
export default MatchingChatScreen;