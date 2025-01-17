import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MainScreen = ({ route }) => {
    const navigation = useNavigation();
    const { userId } = route.params || {};

    return (
        <View style={styles.container}>
            <Text style={styles.title}>메인화면</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('ConversationSelect', { userId })}
            >
                <Text style={styles.buttonText}>대화 시뮬레이션 화면</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    button: {
        backgroundColor: '#FF9AAB',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default MainScreen;
