import React, { useEffect, useState } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [oppositeGenderCount, setOppositeGenderCount] = useState(0); // 이성 사용자 수 상태 추가

  useEffect(() => {
    const loadUserData = async () => {
      const data = JSON.parse(await AsyncStorage.getItem('userData'));
      setUserData(data);
      fetchOppositeGenderCount(data.gender, data.region); // 사용자 데이터에 따라 이성 사용자 수 조회
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const checkUserData = async () => {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData && JSON.stringify(userData) !== storedData) {
            console.log('🔄 변경 감지: 데이터 다시 불러오기');
            setUserData(JSON.parse(storedData));
        }
    };

    const interval = setInterval(checkUserData, 3000); // 🔄 3초마다 확인
    return () => clearInterval(interval); // 🔹 컴포넌트 언마운트 시 정리
  }, [userData]);

  const fetchOppositeGenderCount = async (gender, region) => {
    const oppositeGender = gender === '남성' ? '여성' : '남성';

    try {
      const response = await fetch(`http://192.168.1.27:8080/users/count?gender=${oppositeGender}&region=${region}`);
      const data = await response.json();
      setOppositeGenderCount(data); // API에서 반환된 카운트를 상태로 설정
    } catch (error) {
      console.error('Error fetching opposite gender count:', error);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image source={userData.profilePicture ? { uri: `http://192.168.1.27:8080/${userData.profilePicture}`, cache: 'reload' } : require('../../assets/MainScreen/ima.jpg')}
              style={{ width: 50, height: 50, borderRadius: 30, marginRight: 20, marginLeft: 7, }}
            />

            <Text style={styles.headerText}>{userData.username}{'\n'}
              <Text style={styles.headerText2}>일반고객</Text>
            </Text>
          </View>

          <View>
            <Text style={styles.horizontalLineFirst}></Text>
          </View>

          <TouchableOpacity style={styles.main}>
            <Text style={styles.mainText}>{userData.username}님 주변에{'\n'}
              {oppositeGenderCount}명의 사용자가 있습니다!
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
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ChattingList", {userData: userData})}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,     
    paddingLeft: 30,
    paddingRight: 30,
  },

  header:{
    width: '100%',
    height: 70,
    flexDirection: 'row',
    marginRight : 30,
    marginLeft : 5,
    marginBottom : 1,
    marginTop: Platform.OS === 'android' ? 45 : 15,
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
    marginTop: 0,
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