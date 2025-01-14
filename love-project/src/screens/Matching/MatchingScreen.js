import React, { useState }  from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Platform, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 

import { useNavigation } from '@react-navigation/native';
  
  

const MatchingScreen = () => {
    const navigation = useNavigation();
    const [liked, setLiked] = useState(false);
    const scaleValue = new Animated.Value(1);

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
            <Text style={styles.top}>
                {/* <Icon name="menu" size={40} color="black" />                                       */}
                            
                <Text style={styles.topText}>               소개팅 매칭             </Text>                       
                                
                {/* <Icon name="check" size={40} color="black" />                */}
            </Text>
            <Text style={styles.main}>
                나와 맞는 사람을{'\n'}만나보세요!
            </Text>
            
            <TouchableOpacity style={styles.heartBox} onPress={() => navigation.navigate("MatchingList")}>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                
                <Icon style={styles.heart}                    
                name={liked ? 'heart' : 'heart-o'} 
                size={250} 
                color={liked ? 'red' : 'black'} 
                />
            </Animated.View>
                
                
                
                <Text style={styles.heartText}>
                매칭잡기!
                </Text>
            </TouchableOpacity>                


            <TouchableOpacity style={styles.information} onPress={() => navigation.navigate("MatchingList")}>
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
    
    top: {
        backgroundColor: '#FFF0F0', 
        alignSelf: 'center',
        marginBottom: 30,  
        padding:15, 
        textAlign:'center', 
        width: '100%',  
        height: 70,

        flexDirection: 'row', // Arrange children in a row
        alignItems: 'center', // Vertically center all items
        justifyContent: 'space-between',
    },                

    topText: { 
        color : 'black',
        alignSelf: 'center',
        fontSize:24,        
        textAlign:'center',                    
        flex: 1, // Take up remaining space between the icons                             
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
        marginBottom: 20, 
        textAlign:'center', 
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#FFF',
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