import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';

const DatingAssistant = ({ navigation, route }) => {
    const { coachingResponse, emotions } = route.params;

    return (
        <View style={styles.container}>
            {/* 제목 */}
            <Text style={styles.title}>Dating Coaching</Text>

            {/* 코칭 결과 섹션 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Coaching Result</Text>
                <Text style={styles.content}>{coachingResponse}</Text>
            </View>

            {/* 감정 분석 섹션 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emotion Analysis</Text>
                <FlatList
                    data={emotions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <Text style={styles.listItem}>{item}</Text>}
                />
            </View>

            {/* 뒤로가기 버튼 */}
            <Button
                title="Back to Chat"
                onPress={() => navigation.navigate('ConversationScreen')}
            />
        </View>
    );
};

// 스타일 정의
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        color: '#333',
    },
    listItem: {
        fontSize: 16,
        marginVertical: 5,
        color: '#555',
    },
});

export default DatingAssistant;
