import React, { useState }  from 'react';

import {  TextInput, View, Text, TouchableOpacity, StyleSheet, LogBox, ScrollView} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



const ConversationScreen = () => {
    const navigation = useNavigation();
    const [inputValue, setInputValue, text, setText] = useState('');
    
    return(
    <ScrollView>       
        <View style={styles.container}>
            <Text style={styles.top}>

                
                <Icon name="menu" size={40} color="black" />
               
            
                <Text style={styles.topText}>           AI 대화 연습           </Text>  

               
                <Icon name="check" size={40} color="black" />
                        
            </Text>

            
            <Text style={styles.main}>
                AI와 대화를 시작하기 전에 {'\n'}
                나의 이상형을 만드세요!
            </Text>
            <Text style={styles.middle}>
                나의 이상형을 입력하세요
            </Text>

            <TextInput style={styles.square}
                placeholder="텍스트를 입력하세요"
                value={text}
                onChangeText={(text) => setInputValue(text)} // 텍스트 변경 시 상태 업데이트
            />

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("IdealTypeImg")}>
                <Text style={styles.buttonText}>
                    나의 이상형 생성
                </Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
    );
};

const styles = StyleSheet.create({

    container: { flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',    
      },

    top: { backgroundColor: '#FFF0F0',
        marginBottom: 30, 
        fontSize:26, 
        paddingTop:15, 
        width: '100%',  
        height: 70,
        flexDirection: 'row', // Arrange children in a row
        alignItems: 'center', // Vertically center all items
        justifyContent: 'space-between',
        textAlign:'center', 
    },

    topText: {
        textAlign: 'center', // Center text horizontally within its space
        flex: 1, // Take up remaining space between the icons 
        color : 'black',
        alignSelf: 'center',
        fontSize:26,       
    },
    
    main: { fontSize: 24,
        height: 90, 
        fontWeight: 'bold', 
        marginBottom: 10, 
        color : '#FFB89A', 
        textAlign:'center', 
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
        // alignSelf: 'center',
        borderRadius: 35,
        // justifyContent: 'center',
        // alignItems: 'center',
        width: 300,   
        height: 300, 
        borderWidth: 2,
        borderColor: '#FFB89A', // Color of the square border
        backgroundColor: 'transparent',  // Transparent inside the square
              
        paddingHorizontal: 10,
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