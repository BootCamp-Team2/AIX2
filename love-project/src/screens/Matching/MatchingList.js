import React, { useState }  from 'react';
import {Image, FlatList, View, Text, TouchableOpacity, StyleSheet, Platform, Modal, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const MatchingList = () => {
    const navigation = useNavigation();
    const [liked, setLiked] = useState(false);

    const route = useRoute();
    const { recommend } = route.params;

    // console.log(recommend)

    return(
    <ScrollView style={styles.container}>
    <View>
        <Text style={styles.top}>
            <Icon name="menu" size={40} color="black" />                                      
                         
            <Text style={styles.topText}>                소개팅 리스트              </Text>                       
                              
            <Icon name="check" size={40} color="black" />               
        </Text>
        <FlatList     
            data={recommend}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.profile}>
                        <Image
                            // source={{uri: item.profileImg}} // 인터넷에서 이미지 불러올때
                            source={item.myGender == "남성" 
                                ? require('../../../assets/default-profile-male.png') 
                                : require('../../../assets/default-profile-female.png')}
                            style={styles.profileImg}
                            defaultSource={require('../../../assets/default-profile.png')} // 인터넷에서 이미지 불러오기 전까지 보여줄 이미지
                        />
                        <Text style={styles.name}>{item.name??"ㅇㅇㅇ"}</Text>
                    </View>

                    <View style={styles.box}>
                        <Text style={styles.boxText}>
                            자연스러운 만남을 추구합니다~ 서로 얘기 나누며 친해져 가요~~
                        </Text>
                    </View>



                    {/* <View style={styles.info}>
                        <Text>{item.myGender}</Text> 
                        <Text>{item.myMBTI}</Text>
                        <Text>{item.myHeight}</Text>
                        <Text>{item.myAppearance}</Text>
                    </View> */}
                </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            horizontal={false} // 수평으로 배열
        />                        
    </View>
    </ScrollView>
    );
};
            
const styles = StyleSheet.create({

    container:{
        flex: 1,
    }, 

    img:{},

    box:{
        // backgroundColor: 'white',
        width : '68%',
        height: 100, 
        textAlign:'center',
        justifyContent: 'center',

    },    

    boxText:{
        // color:'white'
        fontSize: 17,
        
    },
    
    top: {
        backgroundColor: '#B2E0F9', 
        alignSelf: 'center',
        marginBottom: 30,  
        padding:10, 
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

    item: {
        padding: 16,
        backgroundColor: '#FF9AAB',
        borderRadius: 8,
        marginRight: 2
    },

    separator: {
        marginTop: 5,
        marginBottom: 5,
        height: 1,
        backgroundColor: '#ccc',
    },

    profile: {
        flexDirection: "column",
        alignItems: "center",
        marginLeft: 30,
        marginRight: 30,
    },

    card: {
        flexDirection: 'row', // 세로 방향 정렬
        alignItems: 'center', // 가로 중앙 정렬
        backgroundColor: '#B2E0F9',
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 10, // 좌우 간격
    },

    profileImg: {
        width: 60,
        height: 60,
        borderRadius: 40, // 동그란 이미지
        marginBottom: 12,
    },
    info: {
        alignItems: 'flex-start', // 텍스트 중앙 정렬
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
});

export default MatchingList;