import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { createUser, validateUser } from '../../chatbot/chatbot_database';

const LoginScreen = ({ navigation }) => {
    const [userId, setUserId] = useState('');

    const handleCreateId = async () => {
        try {
            const newId = await createUser();
            setUserId(newId);
            Alert.alert('Success', `새로운 ID가 생성되었습니다: ${newId}`);
        } catch (error) {
            console.error('Error creating ID:', error);
            Alert.alert('Error', '아이디 생성에 실패했습니다.');
        }
    };
    
    // 로그인 로직
    const handleLogin = async () => {
        try {
            const isValid = await validateUser(userId);
            if (isValid) {
                Alert.alert('Success', '로그인 성공!');
                navigation.navigate('MainScreen', { userId });
            } else {
                Alert.alert('Error', '존재하지 않는 아이디입니다.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            Alert.alert('Error', '로그인에 실패했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="아이디를 입력하세요"
                value={userId}
                onChangeText={setUserId}
            />
            <Button title="아이디 생성" onPress={handleCreateId} />
            <Button title="로그인" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});

export default LoginScreen;
