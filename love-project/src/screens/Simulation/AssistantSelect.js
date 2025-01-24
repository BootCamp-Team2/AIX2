import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from "@react-navigation/native";

const AssistantSelect = ({ navigation }) => {
    const route = useRoute();
    const { userUID } = route.params; // ConversationScreen에서 전달된 userUID
    const [selectedAssistant, setSelectedAssistant] = useState("");

    const serverIP = 'http://192.168.1.30:5000'; // 서버 IP 주소

    const handleStartConversation = async () => {
        if (!selectedAssistant) {
            Alert.alert("Error", "어시스턴트를 선택해주세요.");
            return;
        }

        try {
            const response = await fetch(`${serverIP}/start-conversation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userUID, partner_id: selectedAssistant }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "대화 시작 실패");
            }

            const { thread_key, assistant_key } = await response.json();
            navigation.navigate("AIchat", { threadKey: thread_key, assistantId: assistant_key });
        } catch (error) {
            console.error("대화 시작 오류:", error);
            Alert.alert("Error", "대화를 시작할 수 없습니다.");
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

export default AssistantSelect;
