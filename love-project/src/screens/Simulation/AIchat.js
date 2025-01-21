import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';

const ConversationScreen = ({ navigation, route }) => {
    const { assistantId, threadKey } = route.params; // 선택한 챗봇 ID와 대화 스레드 키
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]); // 대화 내역 저장

    // 챗봇 이름 맵핑
    const chatbotNames = {
        HANA: 'Hana',
        HWARANG: 'Hwarang',
    };
    const chatbotName = chatbotNames[assistantId] || 'Assistant'; // 기본값은 'Assistant'

    // 메시지 전송 함수
    const handleSendMessage = async () => {
        if (!userMessage.trim()) {
            Alert.alert('Error', '메시지를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('http://192.168.0.101:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    thread_id: threadKey,
                    content: userMessage,
                    partner_id: assistantId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'user', content: userMessage },
                { role: 'assistant', content: data.response },
            ]);
            setChatHistory((prevHistory) => [...prevHistory, `You: ${userMessage}`, `${chatbotName}: ${data.response}`]);
            setUserMessage('');
        } catch (error) {
            console.error('Error during conversation:', error);
            Alert.alert('Error', '메시지를 전송하는 동안 오류가 발생했습니다.');
        }
    };

    // 대화 종료 및 연애 코칭 요청 함수
    const handleEndConversation = async () => {
        try {
            const response = await fetch('http://192.168.0.101:5000/dating-coaching', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chat_history: chatHistory }), // 대화 내역 전달
            });

            if (!response.ok) {
                throw new Error('Failed to get dating coaching');
            }

            const data = await response.json();
            navigation.navigate('CoachingScreen', { coachingResponse: data.response }); // 코칭 화면으로 이동
        } catch (error) {
            console.error('Error fetching dating coaching:', error);
            Alert.alert('Error', '연애 코칭을 가져오는 중 오류가 발생했습니다.');
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
                        {msg.role === 'user' ? 'You: ' : `${chatbotName}: `}
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
            <Button title="대화 종료" onPress={handleEndConversation} color="red" />
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
});

export default ConversationScreen;
