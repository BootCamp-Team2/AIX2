// src/ChatRoomList.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';

const ChattingList = () => {
    const [rooms, setRooms] = useState(['General', 'Tech', 'Random']);
    const [newRoom, setNewRoom] = useState('');

    const addRoom = () => {
        if (newRoom.trim() !== '') {
            setRooms([...rooms, newRoom]);
            setNewRoom('');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>채팅방 리스트</Text>
            <FlatList
                data={rooms}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text style={{ fontSize: 18 }}>{item}</Text>}
            />
            <TextInput
                style={{ borderWidth: 1, borderColor: '#ccc', marginTop: 10, padding: 10 }}
                value={newRoom}
                onChangeText={setNewRoom}
                placeholder="새 채팅방 이름"
            />
            <Button title="채팅방 추가" onPress={addRoom} />
        </View>
    );
};

export default ChattingList;

