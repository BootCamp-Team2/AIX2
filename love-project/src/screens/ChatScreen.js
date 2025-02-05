import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Easing, TouchableOpacity, Animated, Image, Text, StyleSheet, View, ActivityIndicator} from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send, Time, Avatar } from 'react-native-gifted-chat';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트
import Icon from 'react-native-vector-icons/MaterialIcons';
import Font from 'react-native-vector-icons/FontAwesome';
import GaugeBar from './GaugeBar'; // GaugeBar 컴포넌트 import

const ChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [liked, setLiked] = useState(false); //UI
  const scaleValue = new Animated.Value(1); //UI
  const [text, setText] = useState(''); // 입력값 상태 추가

  //사랑의 온도 게이지바 구현 
  const [progress, setProgress] = useState(7);  // 초기값을 7%로 설정

  // const { partner } = route.params; // 추천 리스트에서 선택된 사람의 정보
  const userID = "2"; // 현재 사용자 ID (예: 로그인된 사용자 ID)
  const partnerID = "1"; // 선택된 파트너의 ID

  // 채팅 기록 로컬 저장소에서 불러오기
  const loadMessagesFromStorage = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem(`chat_${userID}`);
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
    // console.log("Selected partner data:", partner); // partner 데이터 확인용

    // 이전 채팅 기록 불러오기
    loadMessagesFromStorage();

    // WebSocket 연결 설정
    const newSocket = new WebSocket(`ws://192.168.1.11:8080/ws/chat?userUID=${userID}`);
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
            name: messageData.senderUID === userID ? '나' : "1".userUID,
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

      // 채팅 메시지가 추가될 때마다 progress 증가
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages),
      );
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10; // 채팅 1회당 1% 증가
        return newProgress > 100 ? 100 : newProgress; // 최대 100%로 제한
      });
  
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
        borderTopColor: '#E5E5EA', // 입력창 상단 테두리 색상
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

// 메시지 상태 표시 (예: 전송 중, 전송 완료)
const renderFooter = (props) => {
  const { currentMessage } = props;
  if (currentMessage && currentMessage.sent) {
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>전송 완료</Text>
      </View>
    );
  } else if (currentMessage && currentMessage.pending) {
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>전송 중...</Text>
      </View>
    );
  }
  return null;
};

return (
<View style={styles.container}>
  
<View style={styles.matching}>
  <View >
    <Image source={require('../../assets/MainScreen/ima.jpg')} 
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
    <Image source={require('../../assets/MainScreen/ima.jpg')} 
            style={{width : 60, 
                    height : 60,
                    borderRadius: 30,
                    marginRight: 7,
                    marginLeft: 7,
                    }}
    />                       
  </View>
</View>

  <View style={styles.degree}>
    <Text style={styles.degreeText}>사랑의 온도</Text> 
      <View style={styles.verticalLine} />
        
        <View style={styles.appContainer}>
          {/* 게이지 바 */}
          <GaugeBar progress={progress} /> 
        {/* <View style={styles.verticalLine} />      */}
      </View>
      <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>      
  </View>



    <GiftedChat
      messages={messages}
      onSend={newMessages => onSend(newMessages)}
      user={{
        _id: 2, // 사용자 ID
        name: 'User', // 사용자 이름
        avatar: 'https://static.cdn.kmong.com/gigs/sdatI1688375010.jpg', // 사용자 아바타 URL
      }}
      textInputProps={{
        placeholder: '메시지를 입력하세요...', // 원하는 텍스트로 변경
      }}
      renderBubble={renderBubble}
      renderInputToolbar={renderInputToolbar}
      renderSend={renderSend}
      renderAvatar={renderAvatar}
      renderTime={renderTime}
      renderFooter={renderFooter}
      alwaysShowSend
    />
</View>
);
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 채팅 화면 배경
  },
footerContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 5,
},
footerText: {
  fontSize: 12,
  color: '#667',
},
matching:{
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20
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
    alignSelf: 'center'
}, 

degree:{
  alignSelf: 'center',
  alignItems: 'center',
  backgroundColor: '#FF9AAB',
  width: '95%',
  height: 45,
  borderRadius: 10,
  flexDirection: 'row',

},

degreeText:{
  color: 'white',
  fontSize: 15,
  marginLeft: 10,
},
appContainer: {
  flex: 1,  
},
progressText: {
  marginRight: 10,
  fontSize: 14,
  color: 'white'
},
verticalLine: {
  width: 1.5, // 선의 두께
  height: '80%', // 선의 높이 (부모 컨테이너의 높이에 맞춤)
  backgroundColor: 'white', // 선의 색상
  marginLeft: 5
},

});

export default ChatScreen;