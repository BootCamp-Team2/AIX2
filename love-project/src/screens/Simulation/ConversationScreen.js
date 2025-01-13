import React, { useState }  from 'react';

import { ActivityIndicator, KeyboardAvoidingView, Platform, TextInput, View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const ConversationScreen = () => {
    const navigation = useNavigation();
    const [simulatorUri, setSimulatorUri] = useState(null);
    const [loading, setLoading] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const CreateMySim = async () => {
        if(inputValue == '') {
            alert('이상형을 입력해주세요.');
            return;
        }


        const formData = new FormData();
        formData.append("ideal_type", inputValue);
        
        console.log(`Your Input idealType: ${inputValue}`)

        try {
            setLoading(true);
            const response = await axios.post('http://192.168.1.4:9001/sim/create', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
      
            if (response.data && response.data.simUrl) {
              console.log(response.data.simUrl)
              setSimulatorUri(response.data.simUrl); // 서버에서 반환된 아바타 URL 저장
              
              // 이미지 생성 완료 후 자동으로 다음 페이지로 이동
              navigation.navigate("IdealTypeImg", { simUri: response.data.simUrl });
            }
        } catch (error) {
            console.error('request failed:', error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return(
    <KeyboardAvoidingView 
        // style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS와 Android에 따라 키보드 회피 방식 설정
        keyboardVerticalOffset={50} // 키보드로 인해 뷰가 올라가는 정도 조정
    >
        <ScrollView>       
            <View style={styles.container}>
                <Text style={styles.header}>                    
                    <Icon name="menu" size={40} color="black" />                
                    <Text style={styles.headerText}>            AI 대화 연습            </Text>  
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
                    value={inputValue}
                    onChangeText={(inputValue) => setInputValue(inputValue)} // 텍스트 변경 시 상태 업데이트
                />

                <TouchableOpacity style={styles.button} onPress={() =>  {
                        if(loading == null) {CreateMySim();}
                        else { if(!loading) {
                            navigation.navigate("IdealTypeImg", {simUri: simulatorUri});} 
                        }
                    }} disabled={loading}>
                    <Text style={styles.buttonText}>
                        {loading == null ? "나의 이상형 생성!" : loading ? "나의 이상형 생성중..." : "생성완료!"}
                    </Text>
                </TouchableOpacity>  

                 {loading && ( // loading이 true일 때 로딩 인디케이터 표시
                        <ActivityIndicator size="large" color="#FFB89A" style={styles.loader} />
                    )}              
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({

    loader: {
        marginTop: 20,
    },

    container: { 
        flex: 1, // 전체 화면을 가득 채움
        flexDirection: 'column', // 세로 방향으로 배치
        justifyContent: 'center',
        alignItems: 'center',    
      },

    header: { 
        backgroundColor: '#FFF0F0',
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

    headerText: {
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

    square: {
        textAlign:'center',
        width: 300,   
        height: 300,
        borderRadius: 35,
        marginBottom: 30, 
        borderWidth: 2,
        borderColor: '#FFB89A', // Color of the square border
        backgroundColor: 'transparent',  // Transparent inside the square
        fontSize: 21,      
        paddingHorizontal: 10,
        },

    button: {paddingTop:15,
        backgroundColor: '#FFB89A',
        borderRadius: 23, 
        width: '85%',
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