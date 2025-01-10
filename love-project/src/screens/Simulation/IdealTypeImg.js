import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native';

const IdealTypeImg = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { simUri } = route.params;
    console.log(simUri)

    return(
    <ScrollView>
        <View>
            <Text style={styles.top}>
                <Text style={styles.topText}>AI 대화 연습</Text>               
            </Text>
            <Text style={styles.main}>
                나의 이상형이 생성되었어요!
            </Text>

            {simUri && (
                <View style={styles.circle}>
                    <Image
                        source={{uri:simUri}}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            )}

            <Text style={styles.middle}>
                이제 AI와 대화를 해볼까요? 
            </Text>
                    
            <Text style={styles.conversation}>
                대화 시작하기
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate("ConversationScreen")}>
                <Text style={styles.return}>
                    이상형 다시 만들기
                </Text>

            </TouchableOpacity>

            
        </View>
    </ScrollView>
    );
};

const styles = StyleSheet.create({
  
    top: { backgroundColor: '#FFF0F0', 
        alignSelf: 'center',
        marginBottom: 30, 
        fontSize:26, 
        padding:15, 
        textAlign:'center', 
        width: '100%',  
        height: 70,
    },

    topText: { 
        color : 'black',
        alignSelf: 'center',
        fontSize:26, 
        textAlign:'center',     
    },
    

    main: { fontSize: 25,
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
        width: 300,  
        height: 300,  
        borderColor: 'gray', 
        },
    
    image: {
        width: 250,
        height: 250,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
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
        fontSize:18,
        marginBottom: 15,
        backgroundColor: '#D9D9D9', 
        color : 'white',
        padding: 12, 
        borderRadius: 25, 
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