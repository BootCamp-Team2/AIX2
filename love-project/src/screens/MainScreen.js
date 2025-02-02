import React, { useEffect, useState } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  useEffect(() => {
    const loadUserData = async () => {
      setUserData(JSON.parse(await AsyncStorage.getItem('userData')));
    };

    loadUserData();
  }, []);

  return (
  <ScrollView>
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={userData.profile_picture ? {uri: userData.profile_picture} : require('../../assets/MainScreen/ima.jpg')} 
                style={{width : 50, 
                        height : 50,
                        borderRadius: 30,
                        marginRight: 20,
                        marginLeft: 7,
                        }}
        />

        <Text style={styles.headerText}>{userData.username}{'\n'}
          <Text style={styles.headerText2}>일반고객</Text>
        </Text>
      </View>

      <View>
        <Text style={styles.horizontalLineFirst} >         
        </Text>
      </View>

      <TouchableOpacity style={styles.main} onPress={() => navigation.navigate("MatchingScreen", {userUID: "0026469667"})}>    
        <Text style={styles.mainText}>{userData.username}님 주변에{'\n'}
          300명의 사용자가 있습니다!
        </Text>
      </TouchableOpacity>
           
      <View>
        <Text style={styles.horizontalLine} >         
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MatchingScreen", {userUID: "0026469667", userData: userData})}>      
        <View>
          <Image source={require('../../assets/MainScreen/matching.jpg')} 
              style={styles.imageStyle}
          />
        </View>
          <Text style={styles.textStyle}>
            <Text style={styles.buttonText}>소개팅 매칭{'\n'}
            <Text style={styles.empty}>{'\n'}</Text>  
            <Text style={styles.bottom}>새로운 사람을 만나보세요!</Text>
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ConversationScreen", {userUID: userData.userUID})}>
        <View>
          <Image source={require('../../assets/MainScreen/couple.jpg')} 
              style={styles.imageStyle}
          />
        </View>
          <Text style={styles.textStyle}>
            <Text style={styles.buttonText}>AI 대화 연습{'\n'}
            <Text style={styles.empty}>{'\n'}</Text>
            <Text style={styles.bottom}>대화 스킬을 키워보세요!</Text>
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("CoordinationScreen")}>
        <View>
          <Image source={require('../../assets/MainScreen/coor.jpg')} 
              style={styles.imageStyle}
          />
        </View>
          <Text style={styles.textStyle}>
            <Text style={styles.buttonText}>AI 스타일 코디{'\n'}
            <Text style={styles.empty}>{'\n'}</Text>
            <Text style={styles.bottom}>어울리는 스타일을 찾아보세요!</Text>
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ChattingList")}>
        <View>
          <Image source={require('../../assets/MainScreen/mat.jpg')} 
              style={styles.imageStyle}
          />
        </View>
          <Text style={styles.textStyle}>
            <Text style={styles.buttonText}>채팅 리스트{'\n'}
            <Text style={styles.empty}>{'\n'}</Text>
            <Text style={styles.bottom}>매칭상대와 서로 대화해 보세요!</Text>
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,     
    padding: 30,
  },

  header:{
    width: '100%',
    height: 70,
    flexDirection: 'row',
    marginRight : 30,
    marginLeft : 5,
    marginBottom : 1,
    marginTop: -3
  },

  headerText: {
    color : 'gray', 
    fontSize : 15, 
    height: 50,
    marginTop: 3   
  },
  
  headerText2: {
    color : 'silver', 
    fontSize : 14, 
    height: 50,   
  },

  main: {
    // backgroundColor: '#FF9AAB',
    marginBottom: 5,
    padding: 15,
    borderRadius: 30,
    width: '100%',
    // height: 200,
    alignItems: 'center',
    alignSelf: 'center', 
  },  
  
  mainText: { 
    color: '#FF9AAB',
    height: 60, 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center',
    alignSelf: 'center', 
    // backgroundColor: 'red'
  },

  horizontalLineFirst: {
    marginTop: 4,
    marginBottom: 17,
    width: '100%', 
    height: 1,  
    backgroundColor: 'silver',
    marginVertical: 10, // Space above and below the line
  },
  horizontalLine: {
    marginBottom: 15,
    width: '100%', 
    height: 1,  
    backgroundColor: 'silver',
    marginVertical: 10, // Space above and below the line
  },

  textStyle: {
    alignSelf: 'center',
    height: 50,
  },
  
  button: {
    backgroundColor: '#FF9AAB',
    height: 90,
    margin: 3,
    padding: 10,
    alignSelf: 'center',
    borderRadius: Platform.OS === 'android' ? 17 : 25,
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
    },
  
  buttonText: { 
    color: 'white', 
    fontSize: 17,
    height: 70, 
    fontWeight: 'bold',
    margin: 5
  },

  empty: {
    fontSize: 3,
  },

  bottom: {
    color : 'white', 
    fontSize : 15,
    alignSelf: 'center',
    margin:3,
  },
  imageStyle: {
    width : 70, 
    height : 70,
    borderRadius: 10,
    marginRight: 15,
    marginLeft: 7 
  }
});

export default MainScreen;