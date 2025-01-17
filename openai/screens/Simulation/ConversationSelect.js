import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createThread } from 'chatbot/chatbot';

const ConversationSelect = ({ navigation, route }) => {
    const { userId } = route.params || {};
    const [selectedAssistant, setSelectedAssistant] = useState('');

    // 어시스턴트 키 정의
    const assistantIds = {
        hana: process.env.REACT_APP_PARTNER_ID_HANA,
        hwarang: process.env.REACT_APP_PARTNER_ID_HWARANG,
    };

    const handleStartConversation = async () => {
        console.log(selectedAssistant);
        Alert.alert(selectedAssistant);
        if (!selectedAssistant) {
            Alert.alert('Error', '어시스턴트를 선택해주세요.');
            return;
        }

        const assistant = assistantIds[selectedAssistant];
        if (!assistant) {
            Alert.alert('Error', '유효하지 않은 어시스턴트입니다.');
            return;
        }

        try {
            // 스레드 생성
            const threadKey = await createThread(userId, assistant);

            // 대화 화면으로 이동
            navigation.navigate('ConversationScreen', { assistantId: assistant, threadKey });
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
                console
            >
                <Picker.Item label="선택하세요" value="" />
                <Picker.Item label="Hana" value="hana" />
                <Picker.Item label="Hwarang" value="hwarang" />
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
