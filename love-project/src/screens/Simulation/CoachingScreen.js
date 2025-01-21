import React from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';

const CoachingScreen = ({ route, navigation }) => {
    const { coachingResponse } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>연애 코칭 결과</Text>
            <ScrollView style={styles.responseBox}>
                <Text style={styles.responseText}>{coachingResponse}</Text>
            </ScrollView>
            <Button title="돌아가기" onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    responseBox: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
    responseText: { fontSize: 16, lineHeight: 24 },
});

export default CoachingScreen;
