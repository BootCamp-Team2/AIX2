import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from "@react-navigation/native";

const AssistantSelect = ({ navigation }) => {
    const route = useRoute();
    const { userUID, gender } = route.params; // 전달받은 userUID와 gender
    const [selectedAssistant, setSelectedAssistant] = useState("");
    const [availableAssistants, setAvailableAssistants] = useState([]);
    const [threadExists, setThreadExists] = useState(false); // 스레드 존재 여부
    const [threadData, setThreadData] = useState(null); // 스레드 데이터 저장

    const serverIP = 'http://192.168.1.30:5000'; // 서버 IP 주소

    useEffect(() => {
        // gender 값에 따라 어시스턴트 목록 설정
        if (gender === "male") {
            setAvailableAssistants([{ label: "Hwarang", value: "HWARANG" }]);
        } else if (gender === "female") {
            setAvailableAssistants([{ label: "Hana", value: "HANA" }]);
        }

        // DB에서 스레드 키 확인
        const fetchThreadData = async () => {
            try {
                const response = await fetch(`${serverIP}/get-thread`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userUID }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setThreadExists(true); // 스레드가 있으면 버튼 활성화
                    setThreadData(data); // 스레드 데이터 저장
                } else {
                    setThreadExists(false); // 스레드가 없으면 버튼 비활성화
                }
            } catch (error) {
                // 스레드 없을 때 에러 메시지를 띄우지 않고 버튼만 비활성화
                console.error("스레드 데이터 가져오기 오류:", error);
                setThreadExists(false); // 오류 발생 시 버튼 비활성화
            }
        };

        fetchThreadData();
    }, [userUID, gender]);

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

            navigation.navigate("AIchat", {
                threadKey: thread_key,
                assistantId: assistant_key,
                userUID: userUID,
            });
        } catch (error) {
            console.error("대화 시작 오류:", error);
            Alert.alert("Error", "대화를 시작할 수 없습니다.");
        }
    };

    const handleContinueConversation = () => {
        if (threadData) {
            navigation.navigate("AIchat", {
                threadKey: threadData.thread_key,
                assistantId: threadData.assistant_key,
                userUID: userUID,
            });
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
                {availableAssistants.map((assistant, index) => (
                    <Picker.Item key={index} label={assistant.label} value={assistant.value} />
                ))}
            </Picker>
            <Button title="대화 시작" onPress={handleStartConversation} />
            <Button
                title="대화 이어하기"
                onPress={handleContinueConversation}
                disabled={!threadExists} // 스레드가 없으면 버튼 비활성화
                color={threadExists ? "#ff5757" : "#d3d3d3"} // 활성화 여부에 따라 버튼 색상 변경
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    picker: { height: 50, marginBottom: 20 },
});

export default AssistantSelect;
