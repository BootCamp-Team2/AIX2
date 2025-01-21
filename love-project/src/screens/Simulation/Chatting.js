import React from 'react';

import { Image, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const Chatting = () => {
    const navigation = useNavigation();

    return(
        <View>
            <Text>
                매칭 상대랑 채팅
            </Text>
        </View>
    );
};
export default Chatting;