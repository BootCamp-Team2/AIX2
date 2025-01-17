import React from 'react';

import { Image, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const AIchat = () => {
    const navigation = useNavigation();

    return(
        <View>
            <Text>
                AI 대화하기 화면
            </Text>
        </View>
    );
};
export default AIchat;