import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const MainScreen = () => {
  
  const navigation = useNavigation();

  

  return (

    
   

    <View style={styles.container}>

      



      <Text style={styles.top}>임재현{'\n'}
        <Text style={styles.top2}>VIP고객</Text>
      </Text>21``
      

      
      <TouchableOpacity style={styles.center} onPress={() => navigation.navigate("MatchingScreen")}>
      
        
        <Text style={styles.centerText}>임재현님 주변에{'\n'}
          300명의 사용자가 있습니다!{'\n'}{'\n'}
          클릭하시면{'\n'}
          내 주변 이성들의{'\n'}
          위치를 확인하실 수 있습니다!!
        </Text>
      </TouchableOpacity>
      
      
      
      <Text style={styles.title}>두발로 뛴 임재현</Text>



        


      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MatchingScreen")}>
        <Text style={styles.buttonText}>소개팅 매칭 {'\n'}
        <Text style={styles.bottom}>새로운 사람을 만나보세요!</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ConversationScreen")}>
        <Text style={styles.buttonText}>AI 대화 연습{'\n'}
        <Text style={styles.bottom}>대화 스킬을 키워보세요!</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("CoordinationScreen")}>
        <Text style={styles.buttonText}>AI 스타일 코디{'\n'}
        <Text style={styles.bottom}>어울리는 스타일을 찾아보세요!</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const Tops = StyleSheet.create({
  
})


const styles = StyleSheet.create({
  top: {color : 'gray', fontSize : 15, padding: 10 },
  top2: {color : 'silver', fontSize : 14, padding: 50 },
  bottom: {color : 'white', fontSize : 17},

  center: {
    backgroundColor: '#FF9AAB',
    padding: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    
  },  
  centerText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  
  
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 21, color : 'pink' },
  button: {
    backgroundColor: '#FF9AAB',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});

export default MainScreen;
