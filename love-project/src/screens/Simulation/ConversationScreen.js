import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const ConversationScreen = () => {
  const route = useRoute();
  const { userUID } = route.params;
  const navigation = useNavigation();

  const [simulatorUri, setSimulatorUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [gender, setGender] = useState(null);

  const CreateMySim = async () => {
    if (inputValue === '') {
      alert('이상형을 입력해주세요.');
      return;
    }

    if (gender == null) {
      alert('성별을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('ideal_type', inputValue);
    formData.append('gender', gender);
    formData.append('userUID', userUID);
    console.log(`Your Input idealType: ${inputValue}`);

    try {
      setLoading(true);
      
      const sel_formData = new FormData();
      sel_formData.append('type', 'sim');
      const select_r = await axios.post('http://192.168.1.10:1000/select-server', sel_formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (select_r.data && select_r.data.server_ip === '') {
        Alert.alert('서버가 혼잡합니다. 잠시 후에 다시 시도해주세요.');
        setLoading(false);
        return;
      }
      
      console.log('사용가능한 서버: ', select_r.data.server_ip);
      const response = await axios.post(`${select_r.data.server_ip}/sim/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.data && response.data.simUrl) {
        console.log(response.data.simUrl);
        // 이미지 생성 후 페이지 이동 없이 화면 내에서 이미지 표시
        const generatedPhoto = `http://192.168.1.10:1000/output/${userUID}/mySimulator.jpg?timestamp=${Date.now()}`;
        setSimulatorUri(generatedPhoto);
        // AsyncStorage에 저장 (필요 시 이후에 불러올 수 있도록)
        await AsyncStorage.setItem('idealPhoto', generatedPhoto);
      }
    } catch (error) {
      console.error('request failed:', error.message);
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FBE3D5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={50}
      >
        <ScrollView contentContainerStyle={styles.containerScroll}>
          <View style={styles.container}>
            <View>
              <Text style={styles.horizontalLineFirst}></Text>
            </View>

            <Text style={styles.main}>
              AI와 대화를 시작하기 전에 {'\n'}
              나의 이상형을 만드세요!
            </Text>

            <View>
              <Text style={styles.horizontalLine}></Text>
            </View>

            <Text style={styles.middle}>
              이상형 성별을 선택해 주세요!!
            </Text>

            <View style={styles.selectBox}>
              <TouchableOpacity
                style={[styles.select, gender === 'male' && styles.buttonSelected]}
                onPress={() => setGender('male')}
              >
                <Text style={styles.selectText}>남성</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.select, gender === 'female' && styles.buttonSelected]}
                onPress={() => setGender('female')}
              >
                <Text style={styles.selectText}>여성</Text>
              </TouchableOpacity>
            </View>

            {/* 이미지가 생성되면 TextInput 대신 생성된 이미지 표시 */}
            {simulatorUri ? (
              <Image
                source={{ uri: simulatorUri }}
                style={styles.generatedImage}
                resizeMode="contain"
              />
            ) : (
              <TextInput
                style={styles.textBox}
                placeholder="나의 이상형을 입력하세요"
                value={inputValue}
                onChangeText={(text) => setInputValue(text)}
                multiline={true}
              />
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (simulatorUri) {
                  // 이미지가 생성된 상태라면 "이상형 재생성" 버튼: AsyncStorage의 idealPhoto와 simulatorUri만 초기화
                  AsyncStorage.removeItem('idealPhoto');
                  setSimulatorUri(null);
                } else {
                  CreateMySim();
                }
              }}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {simulatorUri
                  ? '이상형 재생성'
                  : loading
                  ? '나의 이상형 생성중...'
                  : '나의 이상형 생성!'}
              </Text>
            </TouchableOpacity>

            {loading && (
              <ActivityIndicator size="large" color="#FFB89A" style={styles.loader} />
            )}

            <TouchableOpacity
              style={styles.button2}
              onPress={() =>
                navigation.navigate('AssistantSelect', {
                  userUID,
                  gender,
                  idealPhoto: simulatorUri,
                })
              }
            >
              <Text style={styles.button2Text}>AI 대화 바로가기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  containerScroll: {
    flexGrow: 1,
  },
  loader: {
    marginTop: 20,
  },
  container: { 
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',  
  },
  horizontalLineFirst: {
    marginTop: 30,
    marginBottom: Platform.OS === 'android' ? 0 : 15,
    width: 340, 
    height: 1,  
    backgroundColor: 'silver',
    marginVertical: 10,
  },
  horizontalLine: {
    marginBottom: 15,
    marginTop: -3,
    width: 340, 
    height: 1,  
    backgroundColor: 'silver',
    marginVertical: 10,
  },
  main: { 
    fontSize: 24,
    height: 70, 
    fontWeight: 'bold',
    marginTop: 20, 
    marginBottom: 25, 
    color : '#FFB89A', 
    textAlign: 'center', 
    alignSelf: 'center',
  },
  middle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color : '#FFB89A', 
    textAlign: 'center',
    alignSelf: 'center'
  },
  selectBox: {
    flexDirection: 'row',
  },
  select: {
    paddingTop: 10,
    backgroundColor: '#ccc',
    borderRadius: 18, 
    width: '35%',
    height: 55, 
    alignItems: 'center', 
    marginBottom: 10, 
    textAlign: 'center', 
    fontWeight: 'bold',
    alignSelf: 'center',
    marginHorizontal: 15,
  },
  buttonSelected: {
    backgroundColor: '#FFB89A',
  },
  selectText: {
    marginTop: Platform.OS === 'android' ? 1 : 8,
    fontSize: 20,
    color: 'white', 
    width: '80%',
    height: 50, 
    alignItems: 'center', 
    textAlign: 'center', 
    fontWeight: 'bold',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  textBox: {
    marginTop: 20,
    textAlign: 'center',
    width: 300,   
    height: 200,
    borderRadius: 30,
    marginBottom: 30, 
    borderWidth: 2,
    borderColor: '#FFB89A',
    fontSize: 21,      
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  generatedImage: {
    width: 300,
    height: 200,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 30,
  },
  button: {
    paddingTop: Platform.OS === 'android' ? 15 : 20,
    backgroundColor: '#FFB89A',
    borderRadius: 18, 
    width: '75%',
    height: 60, 
    alignItems: 'center', 
    marginBottom: 10, 
    textAlign: 'center', 
    fontWeight: 'bold',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center', 
  },
  buttonText: {
    fontSize: 25,
    color: 'white', 
    width: '80%',
    height: 50, 
    alignItems: 'center', 
    textAlign: 'center', 
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  button2: {
    paddingTop: Platform.OS === 'android' ? 15 : 20,
    backgroundColor: '#FFB89A',
    borderRadius: 18, 
    width: '75%',
    height: 60, 
    alignItems: 'center', 
    marginBottom: 10, 
    textAlign: 'center', 
    fontWeight: 'bold',
    alignSelf: 'center',
    justifyContent: 'center', 
  },
  button2Text: {
    fontSize: 25,
    color: 'white', 
    width: '65%',
    height: 50, 
    alignItems: 'center', 
    textAlign: 'center', 
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  gradientBackground: {
    flex: 1,
  },
});

export default ConversationScreen;
