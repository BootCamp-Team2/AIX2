import React, { useEffect, useState }  from 'react';
import { ActivityIndicator, Animated, View, Text, TouchableOpacity, StyleSheet, Platform, Modal, ScrollView } from 'react-native';
import Font from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ModifyMatchInfo from './ModifyMatchInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient'


const MatchingScreen = () => {
    const navigation = useNavigation();
    const [liked, setLiked] = useState(false);
    const scaleValue = new Animated.Value(1);
    const [loading, setLoading] = useState(true);
    const [userMatchInfo, setUserMatchInfo] = useState(null);

    const [userData, setUserData] = useState({});
    useEffect(() => {
        const loadUserData = async () => {
            setUserData(JSON.parse(await AsyncStorage.getItem('userData')));
        };

        loadUserData();
    }, []);

    useEffect(() => {
        if (!userData.userUID) return;

        const loadMatchUser = async () => {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append("uid", userData.userUID);

                const response = await axios.post("http://192.168.1.10:2000/getMyInfo", formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                });
        
                if(response.data) {
                    setUserMatchInfo(JSON.parse(response.data.userInfo));
                }
            } catch (error) {
                console.error("Error loading userInfo: ", error);
            } finally {
                setLoading(false);
            }
        }

        loadMatchUser();
    }, [userData]);

    const loadMatching = async () => {
        try {
            const formData = new FormData();
            formData.append("uid", userData.userUID);

            const response = await axios.post("http://192.168.1.10:2000/recommend", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // console.log(response.data);

            if(!response.data || response.data.recommend == []) {
                Alert.alert("추천 유저가 없거나, 오류가 발생했습니다.")
                setLoading(false);
                return;
            }

            // console.log(response.data.recommend);
            navigation.navigate("MatchingList", { recommend: response.data.recommend });

        } catch (error) {
            console.error('request failed:', error.message);
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
        <LinearGradient
            colors={['#FFFFFF', '#FFD9D9']} // 원하는 그라데이션 색상
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            >
    <ScrollView contentContainerStyle={styles.containerScroll}>
    <View style={styles.container}>
        {/* <View style={styles.header}>
            <View style={styles.menu}>                   
            <Icon name="menu" size={40} color="black"/>
            </View> 
                            
            <Text style={styles.headerText}>소개팅 매칭</Text>  
            
            <View style={styles.check}>                    
            <Icon name="check" size={40} color="black"/>
            </View>
        </View> */}
            
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

        {(userMatchInfo == null) ? (
            <ActivityIndicator size="large" color="#FF9AAB" style={styles.loader} />
        ) : (
            <TouchableOpacity style={styles.information} onPress={() => {navigation.navigate("ModifyMatchInfo", {matchInfo: userMatchInfo})}}>
                <Text style={styles.informationText}>
                    ※ 나의 정보 ※
                </Text>
                <Text style={styles.informText}>
                    ♥ 나의 MBTI: {userMatchInfo.myMBTI}{'\n'}
                    ♥ 나의 키: {userMatchInfo.myHeight ?? "----"}{'\n'}
                    ♥ 나의 외모: {userMatchInfo.myAppearance ? userMatchInfo.myAppearance.join(", ") : "----"}{'\n'}
                </Text>
            </TouchableOpacity>
        )}

        <Text style={styles.text}>
            나의 정보를 바탕으로 매칭돼요!
        </Text>
        <Text style={styles.detailtext}>
            (정보 미기입시 상관없음으로 분류됩니다.)   
        </Text>        
     </View>
    </ScrollView>
    </LinearGradient>
                );
            };
            
const styles = StyleSheet.create({
    containerScroll:{
        flexGrow: 1,               // ScrollView가 자식 요소의 크기만큼 확장됨
        justifyContent: 'center',  // 세로 중앙 정렬
        alignItems: 'center',      // 가로 중앙 정렬
    },

    container:{
        flex:1,   
        justifyContent: 'center',
    },

    loader: {
        marginTop: 20,
        alignItems: 'center',
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
        fontWeight: "bold",
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
        paddingHorizontal: 25,
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
        width: '90%',
        height: 75, 
        marginLeft: 10,
        marginVertical: 5,
    },

    text: {
        fontSize:15,
        color : '#FF9AAB', 
        width: '80%',
        alignItems: 'center', 
        textAlign:'center', 
        alignSelf: 'center',
        marginVertical: 5,
    },
    detailtext: {
        fontSize:15,
        color : '#FF9AAB', 
        width: '80%',
        fontWeight: "bold",
        alignItems: 'center', 
        textAlign:'center', 
        alignSelf: 'center',
        textDecorationLine: "underline",
    },
    gradientBackground: {
        flex: 1, // 전체 화면을 채우기 위해 flex: 1
      },
});

export default MatchingScreen;