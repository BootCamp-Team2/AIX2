import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet, LogBox} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ConversationScreen = () => {
    return(
        
        <View>
            <Text style={styles.main}>
                AI 대화 연습
            </Text>
            <Text style={styles.top}>
                AI와 대화를 시작하기 전에 {'\n'}
                나의 이상형을 만드세요!
            </Text>
            <Text style={styles.middle}>
                나의 이상형을 입력하세요
            </Text>

            <View style={styles.square} />
            
            {/* <Text style={styles.bottom}>
                나의 이상형 생성
            </Text> */}

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("IdealTypeImg")}>
                <Text style={styles.buttonText}>
                    나의 이상형 생성
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
  
    main: { backgroundColor: '#FFB89A', 
        color : 'black',
        marginBottom: 30, 
        fontSize:26, 
        padding:15, 
        textAlign:'center', 
        fontWeight: 'bold'
    },
    
    top: { fontSize: 24,
        height: 90, 
        fontWeight: 'bold', 
        marginBottom: 10, 
        color : '#FFB89A', 
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center' 
    },
    
    middle: { fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 30, 
        color : '#FFB89A', 
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center'
    },

    square: {marginBottom: 30,
        alignSelf: 'center',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,   // Width of the square
        height: 300,  // Height of the square
        borderWidth: 2,
        borderColor: '#FFB89A', // Color of the square border
        backgroundColor: 'transparent',  // Transparent inside the square
        },


    button: {padding:10,
        backgroundColor: '#FFB89A',
        borderRadius: 30, 
        width: '80%',
        height: 60, 
        alignItems: 'center', 
        marginBottom: 10, 
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center'
    },

    buttonText: {
        fontSize:25,
        color : 'white', 
        width: '80%',
        height: 50, 
        alignItems: 'center', 
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center'
    },
  });



export default ConversationScreen