import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';

const AIchat = ({ navigation, route }) => {
    const { assistantId, threadKey, userUID } = route.params; // userUID 추가
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    const serverIP = 'http://192.168.1.30:5000'; // 서버 IP 주소

    const handleSendMessage = async () => {
        if (!userMessage.trim()) {
            Alert.alert('Error', '메시지를 입력해주세요.');
            return;
        }
    
        if (!threadKey || !assistantId || !userUID) {
            console.error("필수 데이터 누락:", { threadKey, assistantId, userUID });
            Alert.alert('Error', '필수 데이터가 누락되었습니다.');
            return;
        }
    
        console.log("Sending chat request:", {
            thread_key: threadKey,
            content: userMessage,
            partner_id: assistantId,
            userUID: userUID,
        });
    
        try {
            const response = await fetch(`${serverIP}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    thread_key: threadKey,
                    content: userMessage,
                    partner_id: assistantId,
                    userUID: userUID,
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send message');
            }
    
            const data = await response.json();
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'user', content: userMessage },
                { role: 'assistant', content: data.response },
            ]);
            setChatHistory((prevHistory) => [...prevHistory, userMessage, data.response]);
            setUserMessage('');
        } catch (error) {
            console.error('Error during conversation:', error);
            Alert.alert('Error', '메시지를 전송하는 동안 오류가 발생했습니다.');
        }
    };    

    const handleCoaching = async () => {
        try {
            const response = await fetch(`${serverIP}/dating-coaching`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chat_history: chatHistory }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch coaching data');
            }

            const data = await response.json();
            navigation.navigate('CoachingScreen', { coachingResponse: data.response });
        } catch (error) {
            console.error('Error during coaching:', error);
            Alert.alert('Error', '연애 코칭 데이터를 가져오는 동안 오류가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>어시스턴트와 대화</Text>
            <ScrollView style={styles.chatBox}>
                {messages.map((msg, idx) => (
                    <Text
                        key={idx}
                        style={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}
                    >
                        {msg.role === 'user' ? 'You: ' : `${assistantId}: `}
                        {msg.content}
                    </Text>
                ))}
            </ScrollView>
            <TextInput
                style={styles.input}
                placeholder="메시지를 입력하세요"
                value={userMessage}
                onChangeText={setUserMessage}
            />
            <Button title="Send" onPress={handleSendMessage} />
            <TouchableOpacity style={styles.arrowButton} onPress={handleCoaching}>
                <Text style={styles.arrowText}>→</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    chatBox: { flex: 1, marginBottom: 20, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
    userMessage: { textAlign: 'right', color: 'blue', marginVertical: 5 },
    assistantMessage: { textAlign: 'left', color: 'green', marginVertical: 5 },
    input: { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, paddingHorizontal: 10, marginBottom: 10 },
    arrowButton: {
        alignSelf: 'center',
        marginTop: 10,
        padding: 10,
        backgroundColor: '#ff5757',
        borderRadius: 50,
    },
    arrowText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AIchat;
