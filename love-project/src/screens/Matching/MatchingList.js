import React, { useState }  from 'react';
import {Image, FlatList, View, Text, TouchableOpacity, StyleSheet, Platform, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const data = [
    { id: '1', title: '이름' }, 
    { id: '2', title: 'MBTI' },
    { id: '3', title: '지역' },
    { id: '4', title: '외모' },
    { id: '5', title: '키' },
  ];

const MatchingList = () => {
    const navigation = useNavigation();
    const [liked, setLiked] = useState(false);   

    return(
    <ScrollView style={styles.container}>
    <View>
        <Text style={styles.top}>
            <Icon name="menu" size={40} color="black" />                                      
                         
            <Text style={styles.topText}>             소개팅 리스트           </Text>                       
                              
            <Icon name="check" size={40} color="black" />               
        </Text>

        <Text  >
            <View style={styles.img}>
                <Image source={require('../../../assets/MainScreen/cc.jpg')} 
                          style={{width : 50, 
                                  height : 50,
                                  borderRadius: 10,
                                  marginRight: 20,
                                  marginLeft: 7 
                                  }}
                      />
            </View>
        <FlatList     
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.item}>
                    <Text>{item.title}</Text>
                </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            horizontal={true} // 수평으로 배열
            />
        </Text>







                                   
    </View>
    </ScrollView>
    );
};
            
const styles = StyleSheet.create({

    container:{
        flex: 1,

    },    

    img:{
        

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

    item: {
        padding: 16,
        backgroundColor: '#FF9AAB',
        borderRadius: 8,
        marginRight: 2
        
        
        },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        
        },
    
        

        
});

export default MatchingList;