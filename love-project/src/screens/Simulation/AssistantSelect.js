import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const AssistantSelect = ({ navigation }) => {
    const [userId, setUserId] = useState(null); // DB에서 가져온 사용자 ID
    const [selectedAssistant, setSelectedAssistant] = useState('');
    const [hasThreadKey, setHasThreadKey] = useState(false);

    // userId와 thread_key 확인
    useEffect(() => {
        const fetchUserIdAndThreadKey = async () => {
            try {
                // Fetch user ID
                const userIdResponse = await fetch('http://192.168.0.68:5000/get-user-id', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // 세션 쿠키 포함
                });

                const userIdData = await userIdResponse.json();
                if (userIdData.id) {
                    setUserId(userIdData.id);

                    // Check thread key
                    const threadKeyResponse = await fetch('http://192.168.0.68:5000/check-thread', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                    });

                    const threadKeyData = await threadKeyResponse.json();
                    setHasThreadKey(!!threadKeyData.thread_key);
                } else {
                    throw new Error('사용자 ID를 가져올 수 없습니다.');
                }
            } catch (error) {
                console.error('Error fetching user ID or thread key:', error);
                setHasThreadKey(false);
                Alert.alert('Error', '데이터를 가져오는 데 실패했습니다.');
            }
        };

        fetchUserIdAndThreadKey();
    }, []);

    const handleStartConversation = async () => {
        if (!selectedAssistant) {
            Alert.alert('Error', '어시스턴트를 선택해주세요.');
            return;
        }
    
        try {
            const response = await fetch('http://192.168.0.68:5000/start-conversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // 세션 쿠키 포함
                body: JSON.stringify({ partner_id: selectedAssistant }),
            });
    
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create a thread');
            }
    
            const data = await response.json();
            const { thread_key, assistant_key } = data;
    
            // AIchat 페이지로 이동
            navigation.navigate('AIchat', { assistantId: assistant_key, threadKey: thread_key });
        } catch (error) {
            console.error('대화 시작 오류:', error);
            Alert.alert('Error', '대화를 시작할 수 없습니다.');
        }
    };
    
    const handleContinueConversation = async () => {
        try {
            const response = await fetch('http://192.168.0.68:5000/get-thread', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch thread key');
            }
    
            const data = await response.json();
            const { thread_key, assistant_key } = data;
    
            // AIchat 페이지로 이동
            navigation.navigate('AIchat', { threadKey: thread_key, assistantId: assistant_key });
        } catch (error) {
            console.error('Error continuing conversation:', error);
            Alert.alert('Error', '대화를 이어갈 수 없습니다.');
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

            <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: hasThreadKey ? '#FFB89A' : '#D3D3D3' }]}
                onPress={handleContinueConversation}
                disabled={!hasThreadKey}
            >
                <Text style={styles.buttonText}>최근 대화 이어하기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    picker: { height: 50, marginBottom: 20 },
    continueButton: {
        marginTop: 20,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AssistantSelect;
