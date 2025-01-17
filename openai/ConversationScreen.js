import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { sendMessage, activateAssistant, waitForCompletion, getMessages } from '../../../chatbot/chatbot';

const ConversationScreen = ({ route }) => {
    const { assistantId } = route.params;
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [threadId, setThreadId] = useState(`thread-${Date.now()}`); // 임시로 생성된 스레드 ID

    const handleSendMessage = async () => {
        if (!userMessage.trim()) {
            Alert.alert('Error', '메시지를 입력해주세요.');
            return;
        }

        try {
            // 메시지 전송
            await sendMessage(threadId, userMessage);

            // 어시스턴트 활성화
            const runId = await activateAssistant(threadId, assistantId);

            // 응답 대기
            await waitForCompletion(threadId, runId);

            // 메시지 가져오기
            const updatedMessages = await getMessages(threadId);

            setMessages(updatedMessages);
            setUserMessage('');
        } catch (error) {
            console.error('Error during conversation:', error);
            Alert.alert('Error', '대화 중 오류가 발생했습니다.');
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
                        {msg.role === 'user' ? 'You: ' : 'Assistant: '}
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
