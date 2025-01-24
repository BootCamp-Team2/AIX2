import React, { useState }  from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Platform, Modal, ScrollView } from 'react-native';
import Font from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';


const MatchingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userUID } = route.params;

    const [liked, setLiked] = useState(false);
    const scaleValue = new Animated.Value(1);
    const [loading, setLoading] = useState(false);

    const loadMatching = async () => {
        const formData = new FormData();
        formData.append("uid", userUID);

        try {
            setLoading(true);
            const response = await axios.post("http://192.168.1.35:2000/recommend", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if(!response.data) {
                Alert.alert("추천 유저가 없거나, 오류가 발생했습니다.")
                setLoading(false);
                return;
            }

            // console.log(response.data.recommend);
            navigation.navigate("MatchingList", { recommend: response.data.recommend });

        } catch (error) {
            console.error('request failed:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = () => {
        setLiked(!liked);
        Animated.spring(scaleValue, {
          toValue: liked ? 1 : 1.5,
          friction: 3,
          useNativeDriver: true,
        }).start(() => {
          scaleValue.setValue(1);
        });
      };
    
    return(
    <ScrollView>
    <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.menu}>                   
            <Icon name="menu" size={40} color="black"/>
            </View> 
                            
            <Text style={styles.headerText}>소개팅 매칭</Text>  
            
            <View style={styles.check}>                    
            <Icon name="check" size={40} color="black"/>
            </View>
        </View>
            
        <TouchableOpacity style={styles.heartBox} onPress={() => {loadMatching();}}>
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Font style={styles.heart}                    
            name={liked ? 'heart' : 'heart-o'} 
            size={250} 
            color={liked ? 'red' : 'black'} 
            />
        </Animated.View>
            <Text style={styles.heartText}>
            매칭잡기!
            </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.information}>
            <Text style={styles.informationText}>
                나의 정보
            </Text>
            <Text style={styles.informText}>
                MBTI: ISTP{'\n'}
                나이: 25{'\n'}
                지역: 서울{'\n'}
            </Text>
        </TouchableOpacity>

        <Text style={styles.text}>
            나의 정보를 바탕으로 매칭돼요!
        </Text>                           
     </View>
    </ScrollView>
                );
            };
            
const styles = StyleSheet.create({

    container:{
        flex:1,        
    },
    
    menu: {
        position: 'absolute', // 절대 위치 지정
        top: 15, // 상단에서 50px
        left: 10, // 왼쪽에서 20px
        width:'20%'
    },

    check: {
        position: 'absolute', // 절대 위치 지정
        top: 15, // 상단에서 50px
        right: -20, // 왼쪽에서 20px
        width:'20%'
    },

    header: { 
        backgroundColor: '#FFF0F0',
        marginBottom: 20, 
        fontSize:26, 
        paddingTop:15, 
        width: '100%',  
        height: 70,
        flexDirection: 'row', // Arrange children in a row
        alignItems: 'center', // Vertically center all items
        justifyContent: 'center',
        textAlign:'center', 
        alignSelf: 'center',
    },

    headerText: {
        position: 'absolute',
        textAlign: 'center', // Center text horizontally within its space
        color : 'black',
        alignSelf: 'center',
        justifyContent: 'center',
        fontSize:26,  
        width:'100%',
        marginTop:15     
    },
    
    main: { 
        fontSize: 23,
        height: 90, 
        fontWeight: 'bold', 
        marginBottom: 5, 
        color : '#FF9AAB', 
        textAlign:'center', 
        alignSelf: 'center' 
    },            

    heartBox: {
        paddingTop:20,
        backgroundColor: 'transparent',
        borderRadius: 30, 
        width: '80%',
        height: 300,  
        marginBottom: 5, 
        textAlign:'center', 
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'transparent',
        borderWidth: 2,                
    },

    heart: {
        color : '#FF9AAB',            
    },

    heartText: {
        fontSize:21,
        color : '#FF9AAB', 
        width: '80%',
        height: 75, 
        alignItems: 'center', 
        textAlign:'center', 
        alignSelf: 'center'
    },    

    information: {
        paddingTop:10,
        backgroundColor: '#FF9AAB',
        borderRadius: 25, 
        width: '80%',
        height: 150, 
        alignItems: 'center', 
        marginBottom: 20, 
        textAlign:'center', 
        fontWeight: 'bold',
        alignSelf: 'center',
    },

    informationText: {
        fontSize:23,
        color : 'white', 
        width: '80%',
        alignItems: 'center', 
        textAlign:'center', 
        alignSelf: 'center',
        marginVertical: 5,
    },

    informText: {
        fontSize:18,
        color : 'white', 
        width: '80%',
        height: 75, 
        marginLeft: 20,
        marginVertical: 5,
    },

    text: {
        fontSize:15,
        color : '#FF9AAB', 
        width: '80%',
        height: 75, 
        alignItems: 'center', 
        textAlign:'center', 
        alignSelf: 'center',
        marginVertical: 5,
    },
                
});

export default MatchingScreen;