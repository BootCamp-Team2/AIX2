import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ConversationSelect = ({ navigation }) => {
    const [selectedAssistant, setSelectedAssistant] = useState('');

    const assistantIds = {
        hana: process.env.REACT_APP_PARTNER_ID_HANA,
        hwarang: process.env.REACT_APP_PARTNER_ID_HWARANG,
    };

    const handleStartConversation = () => {
        if (!selectedAssistant) {
            Alert.alert('Error', '어시스턴트를 선택해주세요.');
            return;
        }

        const assistantId = assistantIds[selectedAssistant];
        if (!assistantId) {
            Alert.alert('Error', '유효하지 않은 어시스턴트입니다.');
            return;
        }

        navigation.navigate('ConversationScreen', { assistantId });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>어시스턴트를 선택하세요</Text>
            <Picker
                selectedValue={selectedAssistant}
                onValueChange={(value) => setSelectedAssistant(value)}
                style={styles.picker}
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
