import React from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MainScreen = () => {
  
  const navigation = useNavigation();

  return (
  <ScrollView>
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/MainScreen/ima.jpg')} 
                style={{width : 50, 
                        height : 50,
                        borderRadius: 30,
                        marginRight: 20,
                        marginLeft: 7,
                        }}
        />

        <Text style={styles.headerText}>임재현{'\n'}
          <Text style={styles.headerText2}>VIP고객</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.main} onPress={() => navigation.navigate("MatchingScreen")}>             
        <Text style={styles.mainText}>임재현님 주변에{'\n'}
          300명의 사용자가 있습니다!{'\n'}{'\n'}
          클릭하시면{'\n'}
          내 주변 이성들의{'\n'}
          위치를 확인하실 수 있습니다!!
        </Text>
      </TouchableOpacity>
           
      <View>
        <Text style={styles.horizontalLine} >         
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MatchingScreen")}>      
        <View>
          <Image source={require('../../assets/MainScreen/matching.jpg')} 
              style={{width : 70, 
                      height : 70,
                      borderRadius: 10,
                      marginRight: 20,
                      marginLeft: 7
                      }}
          />
        </View>

          <Text style={styles.textStyle}>
            <Text style={styles.buttonText}>소개팅 매칭{'\n'}
            <Text style={styles.empty}>{'\n'}</Text>  
            <Text style={styles.bottom}>새로운 사람을 만나보세요!</Text>
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ConversationScreen")}>
        <View>
          <Image source={require('../../assets/MainScreen/couple.jpg')} 
              style={{width : 70, 
                      height : 70,
                      borderRadius: 10,
                      marginRight: 20,
                      marginLeft: 7 
                      }}
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
              style={{width : 70, 
                      height : 70,
                      borderRadius: 10,
                      marginRight: 20,
                      marginLeft: 7  
                      }}
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
              style={{width : 70, 
                      height : 70,
                      borderRadius: 10,
                      marginRight: 20,
                      marginLeft: 7  
                      }}
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
    marginTop: 30
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
    backgroundColor: '#FF9AAB',
    marginBottom: 10,
    paddingTop: 40,
    borderRadius: 30,
    width: '100%',
    height: 200,
    alignItems: 'center',
    alignSelf: 'center', 
  },  
  
  mainText: { 
    color: 'white',
    height: 180, 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center',
    alignSelf: 'center', 
  },

  horizontalLine: {
    width: '100%', 
    height: 1,  
    backgroundColor: 'silver',
    marginVertical: 10, // Space above and below the line
  },

  textStyle: {
    paddingTop: 12,
  },
  
  button: {
    backgroundColor: '#FF9AAB',
    height: 90,
    margin: 3,
    padding: 10,
    borderRadius: 25,
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
});

export default MainScreen;