import React from 'react';

import { Image, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const MainScreen = () => {
  
  const navigation = useNavigation();

  return (
  <ScrollView>
    <View style={styles.container}>
      <View style={styles.top}>
        <Image source={require('../../assets/MainScreen/cc.jpg')} 
                style={{width : 50, 
                        height : 50,
                        borderRadius: 30,
                        marginRight: 20,
                        marginLeft: 7,
                        }}
        />


        <Text style={styles.topText}>임재현{'\n'}
          <Text style={styles.topText2}>VIP고객</Text>
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
          <Image source={require('../../assets/MainScreen/cc.jpg')} 
              style={{width : 70, 
                      height : 70,
                      borderRadius: 10,
                      marginRight: 20,
                      marginLeft: 7
                      }}
          />
        </View>
        
        <Text style={styles.buttonText}>소개팅 매칭{'\n'}
        <Text style={styles.empty}>{'\n'}</Text>  
        <Text style={styles.bottom}>새로운 사람을 만나보세요!</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ConversationScreen")}>
      <View>
          <Image source={require('../../assets/MainScreen/mario.png')} 
              style={{width : 70, 
                      height : 70,
                      borderRadius: 10,
                      marginRight: 20,
                      marginLeft: 7 
                      }}
          />
        </View>
        
        <Text style={styles.buttonText}>AI 대화 연습{'\n'}
        <Text style={styles.empty}>{'\n'}</Text>
        <Text style={styles.bottom}>대화 스킬을 키워보세요!</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("CoordinationScreen")}>
        <View>
          <Image source={require('../../assets/MainScreen/cc.jpg')} 
              style={{width : 70, 
                      height : 70,
                      borderRadius: 10,
                      marginRight: 20,
                      marginLeft: 7  
                      }}
          />
        </View>
        
        <Text style={styles.buttonText}>AI 스타일 코디{'\n'}
        <Text style={styles.empty}>{'\n'}</Text>
        <Text style={styles.bottom}>어울리는 스타일을 찾아보세요!</Text>
        </Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
  );
};

const Tops = StyleSheet.create({
  
})


const styles = StyleSheet.create({
  container: { flex: 1,     
    padding: 30,
  },

  top:{width: '100%',
    height: 70,
    flexDirection: 'row',
    marginRight : 30,
    marginLeft : 20,
    marginBottom : 5,
    marginTop: 40
  },

  topText: {color : 'gray', 
    fontSize : 15, 
    height: 50,   
  },
  
  topText2: {color : 'silver', 
    fontSize : 14, 
    height: 50,   
  },

  main: {
    backgroundColor: '#FF9AAB',
    alignSelf: 'center',
    margin: 5,
    padding: 15,
    borderRadius: 30,
    width: '100%',
    height: 200,
    alignItems: 'center',
    marginBottom: 10, 
  },  
  
  mainText: { color: 'white',
    height: 180, 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center',
    alignSelf: 'center' 
  },

  horizontalLine: {
    width: '100%', // Width of the line
    height: 1,    // Thickness of the line
    backgroundColor: 'silver', // Line color
    marginVertical: 10, // Space above and below the line
  },
  
  button: {
    backgroundColor: '#FF9AAB',
    height: 90,
    margin: 3,
    padding: 10,
    borderRadius: 25,
    width: '100%',
    marginBottom: 15,
    flexDirection: 'row',
    },
  
  buttonText: { color: 'white', 
    fontSize: 17,
    height: 70, 
    fontWeight: 'bold',
    margin: 5
  },

  empty: {
    fontSize: 2,
  },

  bottom: {color : 'white', 
    fontSize : 15,
    alignSelf: 'center',
    margin:3,
  },
});

export default MainScreen;