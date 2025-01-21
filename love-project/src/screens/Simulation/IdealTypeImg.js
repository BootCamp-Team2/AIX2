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
            <Text style={styles.header}>
                <Text style={styles.headerText}>AI 대화 연습</Text>               
            </Text>
            <Text style={styles.main}>
                나의 이상형이 생성되었어요!
            </Text>

            {simUri && (
                <View style={styles.square}>
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
  
    header: { 
        backgroundColor: '#FFF0F0', 
        alignSelf: 'center',
        marginBottom: 30, 
        fontSize:26, 
        paddingTop:18, 
        textAlign:'center', 
        width: '100%',  
        height: 70,
    },

    headerText: { 
        color : 'black',
        alignSelf: 'center',
        fontSize:26, 
        textAlign:'center',     
    },
    
    main: { 
        fontSize: 25,
        marginBottom: 35,   
        color : '#FFB89A', 
        textAlign:'center',  
        alignSelf: 'center' 
    },

    square: {
        width: 300,   
        height: 300,
        borderRadius: 30,
        marginBottom: 30,
        backgroundColor: '#D9D9D9',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',  
        borderColor: 'gray', 
        },
    
    image: {
        width: 300,
        height: 300,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#ddd',
        },

    middle: { 
        fontSize: 24,  
        marginBottom: 20, 
        color : '#FFB89A', 
        textAlign:'center',  
        alignSelf: 'center'
    },

    conversation: {
        fontSize:21,
        marginBottom: 15,
        backgroundColor: '#FFB89A', 
        color : 'white',
        paddingTop: 18, 
        borderRadius: 25, 
        width: '70%',
        height: 60, 
        alignItems: 'center',  
        textAlign:'center', 
        alignSelf: 'center'
    },

    return: { 
        fontSize:21,
        marginBottom: 15,
        backgroundColor: '#D9D9D9', 
        color : 'white',
        paddingTop: 16, 
        borderRadius: 25, 
        width: '70%',
        height: 60, 
        alignItems: 'center', 
        marginBottom: 10, 
        textAlign:'center', 
        alignSelf: 'center'
    },
  });


export default IdealTypeImg;