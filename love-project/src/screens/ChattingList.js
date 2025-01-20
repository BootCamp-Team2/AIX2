// src/ChatRoomList.js
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const ChattingList = () => {
    const [chatRooms] = useState([
        { id: 1, name: '친구와의 대화', lastMessage: '안녕!', timestamp: '2025-01-20 16:30' },
        { id: 2, name: '가족 그룹', lastMessage: '저녁 뭐 먹을까?', timestamp: '2025-01-20 15:45' },
        { id: 3, name: '동아리', lastMessage: '다음 모임 일정', timestamp: '2025-01-19 18:00' },
    ]);

    const handleRoomClick = (room) => {
        // 클릭 시 동작을 추가할 수 있습니다.
        console.log(`Selected room: ${room.name}`);
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.roomList}>
                    <Text style={styles.title}>채팅방 목록</Text>
                    <FlatList
                        data={chatRooms}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleRoomClick(item)}
                                style={styles.roomItem}
                            >
                                <Text style={styles.roomName}>{item.name}</Text>
                                <Text>{item.lastMessage}</Text>
                                <Text style={styles.timestamp}>{item.timestamp}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    roomList: {
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    roomItem: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginVertical: 5,
        backgroundColor: '#fff',
    },
    roomName: {
        fontWeight: 'bold',
    },
    timestamp: {
        color: '#888',
        fontSize: 12,
    },
});

export default ChattingList;