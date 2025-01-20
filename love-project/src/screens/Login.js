import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

const Login = ({ navigation }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!userId || !password) {
            Alert.alert('Error', 'ID와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('http://192.168.0.68:5000/login', { // Flask 서버 URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ id: userId, password }),
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('로그인 성공', `환영합니다, ${data.nickname}님!`);
                navigation.navigate('AssistantSelect'); // 로그인 성공 시 이동할 페이지
            } else {
                Alert.alert('로그인 실패', data.error || '잘못된 ID 또는 비밀번호입니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', '로그인 중 문제가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>로그인</Text>
            <TextInput
                style={styles.input}
                placeholder="ID를 입력하세요"
                value={userId}
                onChangeText={setUserId}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChangeText={setPassword}
                secureTextEntry // 비밀번호 입력 필드로 설정
            />
            <Button title="로그인" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
});

export default Login;
