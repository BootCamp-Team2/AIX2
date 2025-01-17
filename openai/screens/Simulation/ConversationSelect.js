import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ConversationSelect = ({ navigation }) => {
    const userId = "12345"; // user_id를 고정
    const [selectedAssistant, setSelectedAssistant] = useState('');

    const handleStartConversation = async () => {
        if (!selectedAssistant) {
            Alert.alert('Error', '어시스턴트를 선택해주세요.');
            return;
        }

        try {
            const response = await fetch('http://192.168.0.68:5000/chat', { // Flask 서버 IP
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,            // 고정된 user_id
                    partner_id: selectedAssistant, // 선택된 어시스턴트
                    content: ' ',                // 초기 메시지
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create a thread');
            }

            const data = await response.json();
            const threadKey = data.thread_key || 'default_thread_key'; // 서버에서 반환된 스레드 키 사용

            navigation.navigate('ConversationScreen', { assistantId: selectedAssistant, threadKey });
        } catch (error) {
            console.error('대화 시작 오류:', error);
            Alert.alert('Error', '대화를 시작할 수 없습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>어시스턴트를 선택하세요</Text>
            <Picker
                selectedValue={selectedAssistant}
                onValueChange={setSelectedAssistant}
                style={styles.picker}
            >
                <Picker.Item label="선택하세요" value="" />
                <Picker.Item label="Hana" value="HANA" />
                <Picker.Item label="Hwarang" value="HWARANG" />
            </Picker>
            <Button title="대화 시작" onPress={handleStartConversation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    picker: { height: 50, marginBottom: 20 },
});

export default ConversationSelect;
