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
                        나의 이상형 생성
                    </Text>

                    <Text style={styles.return}>
                        나의 이상형 생성
                    </Text>
                </View>
    );
};

const styles = StyleSheet.create({
  
    main: { backgroundColor: '#FFB89A', 
        color : 'black', 
        fontSize:26, 
        padding:15, 
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    top: { fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 21, 
        color : '#FFB89A', 
        textAlign:'center', 
        padding:20,
        margin: 10, 
        fontWeight: 'bold',
        alignSelf: 'center' 
    },
    middle: { fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 21, 
        color : '#FFB89A', 
        textAlign:'center', 
        padding:5, 
        fontWeight: 'bold',
        alignSelf: 'center'
    },

    circle: {margin:30,
        alignSelf: 'center',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,   // Width of the square
        height: 300,  // Height of the square
        borderWidth: 2,
        borderColor: 'gray', // Color of the square border
        backgroundColor: 'transparent',  // Transparent inside the square
          },


    conversation: {margin:30, 
        fontSize:25,
        backgroundColor: '#FFB89A', 
        color : 'white',
        padding: 15, 
        borderRadius: 30, 
        width: '80%',
        height: '10%', 
        alignItems: 'center', 
        marginBottom: 10, 
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center'
    },

    return: {margin:30, 
        fontSize:25,
        backgroundColor: 'gray', 
        color : 'white',
        padding: 15, 
        borderRadius: 30, 
        width: '80%',
        height: '10%', 
        alignItems: 'center', 
        marginBottom: 10, 
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center'
    },
  });


export default IdealTypeImg;