import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';

const IdealTypeImg = () => {
    return(
        <View>
                    <Text style={styles.main}>
                        AI 대화 연습
                    </Text>
                    <Text style={styles.top}>
                        나의 이상형이 생성되었어요!
                    </Text>
        
                    <View style={styles.circle} />

                    <Text style={styles.middle}>
                        이제 AI와 대화를 해볼까요? 
                    </Text>
                    
                    <Text style={styles.conversation}>
                        대화 시작하기
                    </Text>

                    <Text style={styles.return}>
                        이상형 다시 만들기
                    </Text>
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
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    top: { fontSize: 25,
        marginBottom: 35, 
        fontWeight: 'bold',  
        color : '#FFB89A', 
        textAlign:'center',  
        fontWeight: 'bold',
        alignSelf: 'center' 
    },

    circle: {marginBottom: 30,
        backgroundColor: '#D9D9D9',
        alignSelf: 'center',
        borderRadius: 200,
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,   // Width of the square
        height: 300,  // Height of the square
        borderWidth: 2,
        borderColor: 'gray', // Color of the square border
        },

    middle: { fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20, 
        color : '#FFB89A', 
        textAlign:'center',  
        fontWeight: 'bold',
        alignSelf: 'center'
    },

    conversation: {
        fontSize:21,
        marginBottom: 15,
        backgroundColor: '#FFB89A', 
        color : 'white',
        padding: 12, 
        borderRadius: 25, 
        width: '70%',
        height: 60, 
        alignItems: 'center',  
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center'
    },

    return: { 
        fontSize:21,
        marginBottom: 30,
        backgroundColor: '#D9D9D9', 
        color : 'white',
        padding: 12, 
        borderRadius: 30, 
        width: '70%',
        height: 60, 
        alignItems: 'center', 
        marginBottom: 10, 
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center'
    },
  });


export default IdealTypeImg;