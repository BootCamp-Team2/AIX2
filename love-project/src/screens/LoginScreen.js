import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { loginUser, checkTokenValidity } from '../api/authAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 화면이 포커스를 받을 때 입력 필드 초기화
  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setErrorMessage('');
    }, [])
  );

  // 앱 재접속 시 JWT 유효성 검사 후 자동 로그인 처리
  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        // 토큰이 없을 경우
        if (!token) {
          console.log("토큰이 없습니다. 로그인 화면으로 이동합니다.");
          navigation.navigate("LoginScreen");
          return;
        }

        // 토큰이 있을 경우 유효성 검사
        const response = await checkTokenValidity(token);
        // console.log(response)

        if (response.valid) { // valid 값을 체크
          console.log("토큰이 유효합니다. 메인 화면으로 이동합니다.");
          navigation.navigate("MainScreen", {userData : response.user});
        } else {
          console.log("토큰이 유효하지 않습니다. 로그인 화면으로 이동합니다.");
          navigation.navigate("LoginScreen");
        }
      } catch (error) {
        console.error("자동 로그인 중 오류:", error);
        Alert.alert("오류", "자동 로그인 중 문제가 발생했습니다.");
        navigation.navigate("LoginScreen");
      }
    };

    checkAutoLogin();
  }, []);

  // 로그인 처리 핸들러
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("아이디(이메일)와 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      const response = await loginUser(email, password);
      // console.log("Data Checking! : ", response);

      if (response.token) {
        // 로그인 성공 처리
        console.log('로그인 성공');
        setEmail('');
        setPassword('');
        setErrorMessage('');

        // JWT 토큰이 반환된 경우
        await AsyncStorage.setItem('token', response.token);
        navigation.navigate("MainScreen", { userData: response.user }); // 메인화면 이동
      } else if (response.loginStatus === 0) {
        // 로그인 실패 시 반환된 메시지를 오류 메시지로 설정
        setErrorMessage('로그인 실패: ' + response.message);
      }
    } catch (error) {
      // 서버 오류 처리
      if (error.response) {
        const errorResponse = error.response.data;
        // 로그인 실패 시 서버 반환 메시지 오류 메시지로 설정
        if (errorResponse && errorResponse.loginStatus !== undefined) {
          setErrorMessage(`로그인 실패: ${errorResponse.message}`);
        } else {
          setErrorMessage('로그인 처리 중 예기치 못한 오류가 발생했습니다.');
        }
      } else {
        // 네트워크 오류 또는 기타 예외 처리
        setErrorMessage('로그인 처리 중 오류가 발생했습니다.');
      }
      console.error('로그인 오류:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoView}>
          <Image source={require('../../assets/LP.png')} style={styles.logo} />
        </View>
        <View style={styles.LoginView}>
          <TextInput
            style={styles.TextInput}
            onChangeText={setEmail}
            value={email}
            placeholder="아이디"
            placeholderTextColor="#D9D9D9"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.TextInput}
            onChangeText={setPassword}
            value={password}
            placeholder="비밀번호"
            placeholderTextColor="#D9D9D9"
            secureTextEntry={true}
          />

          {errorMessage ? (
            <Text style={styles.ErrorMessage}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity style={styles.LoginBtn} onPress={handleLogin}>
            <Text style={styles.BtnText}>로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.SignUpText}>회원가입 하러가기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoView: {
    justifyContent: 'center',  // 세로 중앙 정렬
    alignItems: 'center',      // 가로 중앙 정렬
  },
  logo: {
    width: 300,                 // 로고 너비
    height: 300,                // 로고 높이
    marginTop: "35%",    
    marginBottom: -70,          // 수직 위치 조정
    resizeMode: 'contain',      // 로고 크기를 너비와 높이에 맞게 조정
  },
  LoginView: {
    flex: 1,
    padding: 20,
    margin: 35,
    marginBottom: "50%",
    justifyContent: 'center',
    borderRadius: 6,
  },
  scrollContent: {
    flexGrow: 1, // 스크롤뷰 내용이 밀릴 수 있도록 설정
    justifyContent: 'center',
  },
  TextInput: {
    marginTop: 8,
    paddingHorizontal: 10,
    height: 45,
    borderRadius: 6,
    borderColor: '#ff5757',
    borderWidth: 1,
    width: '110%',  // 너비를 90%로 설정 (부모 컨테이너의 90%)
    alignSelf: 'center', // 중앙 정렬
  },
  LoginBtn: {
    margin: 10,
    marginTop: 20,
    backgroundColor: "#ff5757",
    padding: 10,
    width: "110%",
    alignSelf: "center",
    borderRadius: 10
  },
  BtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
    paddingTop: 7,
    height: 30
  },
  SignUpText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#ff5757',
    marginTop: -10,
  },
  ErrorMessage: {
    color: 'red', 
    marginBottom: 10,
    textAlign: 'center', 
  },
});
