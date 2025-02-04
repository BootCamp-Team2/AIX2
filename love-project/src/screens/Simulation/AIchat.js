import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const serverURL = "http://192.168.1.32:5000"; // 서버 URL 전역 변수

const AIchat = ({ route }) => {
  const navigation = useNavigation();
  const { threadKey, assistantId, userUID, idealPhoto } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    // 채팅 기록 가져오기
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${serverURL}/chat-history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadKey, userUID }),
        });
        const data = await response.json();
  
        // 메시지를 오래된 순으로 표시 (백엔드에서 이미 reverse 적용됨)
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
  
    fetchMessages();
  }, [threadKey, userUID]);  
  
  const sendMessage = async () => {
    if (!inputText.trim()) return;
 
    const newMessage = {
      role: "user",
      content: inputText,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");

    try {
      const response = await fetch(`${serverURL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_key: threadKey,
          content: inputText,
          partner_id: assistantId,
          userUID,
        }),
      });
      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendForCoaching = async () => {
    try {
      const response = await fetch(`${serverURL}/dating-coaching`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_history: messages.map((msg) => msg.content), // 채팅 기록만 추출
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch coaching response");
      }

      const data = await response.json();
      navigation.navigate("CoachingScreen", { coachingResponse: data.response });
    } catch (error) {
      console.error("Error fetching coaching response:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>어시스턴트와 대화</Text>

      <ScrollView contentContainerStyle={styles.chatContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageRow,
              msg.role === "user" ? styles.userRow : styles.assistantRow,
            ]}
          >
            {msg.role === "assistant" && (
              <Image
                source={{ uri: idealPhoto }} // 챗봇 이미지만 표시
                style={styles.profileImage}
              />
            )}
            <Text
              style={msg.role === "user" ? styles.userMessage : styles.assistantMessage}
            >
              {msg.content}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.coachingButton} onPress={sendForCoaching}>
        <Text style={styles.coachingButtonText}>대화 평가 ➡</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FF9AAB",
    marginVertical: 20,
  },
  chatContainer: {
    flexGrow: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    margin: 20,
    backgroundColor: "#f9f9f9",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  userRow: { justifyContent: "flex-end" },
  assistantRow: { justifyContent: "flex-start" },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userMessage: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  assistantMessage: {
    backgroundColor: "#FF9AAB",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: { color: "#fff", fontSize: 16 },
  coachingButton: {
    alignSelf: "center",
    marginVertical: 20,
    backgroundColor: "#FF9AAB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  coachingButtonText: { color: "#fff", fontSize: 16 },
});

export default AIchat;
