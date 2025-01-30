import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Image } from "react-native"; 
import { useNavigation, useFocusEffect } from "@react-navigation/native"; 
import { SignUpUser, checkID } from "../api/authAPI"; 
import DateTimePicker from '@react-native-community/datetimepicker'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { FormCheck } from 'react-native-elements';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mbti, setmbti] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [region, setregion] = useState('');
  const [job, setJob] = useState('');
  const [introduce, setIntroduce] = useState('');
  const [birthDate, setBirthDate] = useState(new Date()); // 초기값 Date 객체로 설정
  const [isDuplicateID, setIsDuplicateID] = useState(false); // ID 중복 여부
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 비밀번호 보이기 상태
  const [isIDChecked, setIsIDChecked] = useState(false); // ID 중복 확인 버튼 클릭 여부
  const [showPicker, setShowPicker] = useState(false); // 날짜 선택기 표시 여부

  
  const [emailError, setEmailError] = useState('');// 에러 메시지 상태 관리
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formError, setFormError] = useState('');// 전체 폼 오류 메시지 (필수 항목 누락 등)

  
  useFocusEffect(// 화면이 포커스를 받을 때 입력 필드 초기화
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setmbti('');
      setNickname('');
      setGender('');
      setAge('');
      setregion('');
      setJob('');
      setIntroduce('');
      setBirthDate(new Date());
      setIsDuplicateID(false);
      setIsIDChecked(false);
      setEmailError('');
      setPasswordError('');
      setConfirmPasswordError('');
      setFormError('');

      return () => {
        
      };// Cleanup function (optional)
    }, [])
  );

 
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // ID 유효성 검사 정규식
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;  // 비밀번호 유효성 검사 정규식 (최소 8자, 하나 이상의 숫자, 대소문자 및 특수 문자 포함)

  const handleCheckDuplicate = async () => {
    try {
      const isDuplicate = await checkID(email);
      setIsIDChecked(true); // 중복 확인 버튼 클릭 표시
      setIsDuplicateID(isDuplicate); // 중복 여부 상태 업데이트
  
      // 중복 여부에 따라 에러 메시지 설정
      if (isDuplicate) {
        setEmailError("중복된 ID입니다.");
      } else {
        setEmailError("중복되지 않은 ID입니다."); // 나중에 초록색으로 출력
      }
    } catch (error) {
      setEmailError('ID 중복 확인 오류');
      console.error(error);
    }
  };

const handleConfirmPassword = (text) => { // 비밀번호 일치 여부 즉시 확인
    setConfirmPassword(text);
    setConfirmPasswordError(text !== password ? "비밀번호가 일치하지 않습니다." : '');
};

const handleSignUp = async () => {  // 회원가입 버튼 핸들러
  if (!email || !password || !confirmPassword || !mbti || !nickname || !gender || !age || !region || !job || !introduce || !birthDate) {
     setFormError("모든 항목을 입력해 주세요.");
     return;
  }
  
 

  let hasError = false; // 유효성 검사 플래그
  if (!emailRegex.test(email)) {
     setEmailError("유효한 이메일 주소를 입력하세요.");
     hasError = true;
  } else {
     setEmailError('');
  }
  if (!passwordRegex.test(password)) {
     setPasswordError("비밀번호는 8자 이상, 하나 이상의 숫자, 대소문자, 특수 문자를 포함해야 합니다.");
     hasError = true;
  } else {
     setPasswordError('');
  }
  
  if (password !== confirmPassword) { // 비밀번호 재확인
     setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
     hasError = true;
  } else {
     setConfirmPasswordError('');
  }
  
  if (!isIDChecked) { // ID 중복 확인 여부 체크
     setEmailError("ID 중복 확인을 해주세요.");  // 중복 확인을 클릭하지 않은 경우 메시지 표시
     return;
  }
  
  if (isDuplicateID) { // ID 중복된 경우 회원가입 불가
     setEmailError("중복된 ID입니다. 다른 ID를 입력하세요.");  // 중복된 ID일 경우 메시지 표시
     return;
  }
  
  if (hasError) { // 에러가 있으면 회원가입 처리 중단
     return;
  }
  
  const formattedBirthDate = birthDate.toISOString().split('T')[0]; // birthDate를 YYYY-MM-DD 형식으로 변환

  console.log(password);
  
  try { // 서버로 회원가입 데이터 전송 후 응답 대기
     const response = await SignUpUser(email, password, nickname, gender, age, region, job, introduce, formattedBirthDate, mbti, region);
     if (response) {
        navigation.navigate("LoginScreen", { screen: 'LoginScreen' }); // 로그인 화면 이동
     } else {
        setFormError(response.message || '회원가입에 실패했습니다. 다시 시도해 주세요.'); // 서버에서 받은 실패 메시지를 formError에 저장
     }
  } catch (error) { // 오류 발생시 에러 메시지 출력
     setFormError('회원가입 처리 중 오류가 발생했습니다.');
     console.error(error);
  }
  };

  const onChange = (event, selectedDate) => { // 날짜 선택기 핸들러
    const birthDate = selectedDate || birthDate;  // 선택된 날짜 또는 기존 날짜
    setShowPicker(false);
    setBirthDate(birthDate);  // 생년월일 정보 업데이트
  };

  const openDatePicker = () => {
    setShowPicker(true);
  };

  const formattedBirthDate = birthDate.toISOString().split('T')[0]; // 날짜를 YYYY-MM-DD 형식으로 변환
  

  return (
    <View style={Styles.container}>     
      <View style={Styles.logoView}>
        <Image source={require('../../assets/LP.png')} style={Styles.logo} />
      </View> 
      
      <View style = {Styles.RegisterView}>
        <KeyboardAwareScrollView 
          extraHeight={300} // 키보드가 올라올 때 추가로 화면을 위로 밀어주는 높이
          enableOnAndroid={true}  // 안드로이드에서 키보드가 올라올 때 화면이 자동으로 스크롤
          enableAutomaticScroll={Platform.OS === 'ios'} // iOS에서는 자동으로 스크롤이 활성화
          contentContainerStyle={{ height: -30 }}  // ScrollView 내의 콘텐츠 높이를 -30으로 설정하여 약간의 여백을 주는 효과
          resetScrollToCoords={{ x: 0, y: 0 }}  // 키보드가 닫힐 때 스크롤 위치를 (0, 0)으로 초기화
          scrollEnabled={true}  // 스크롤을 활성화
        >

          {/* 필드들이 RegisterView 밖으로 벗어나지 않도록 하고, 벗어날 경우 스크롤 */}
          <ScrollView contentContainerStyle={Styles.scrollContent}>
            <View style={Styles.formContainer}>
              <Text style={Styles.text}>아이디 (이메일)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                <TextInput 
                  style={[Styles.TextInput, {flex: 1}]} 
                  onChangeText={setEmail}
                  placeholder="아이디 (이메일)"
                  placeholderTextColor="#D9D9D9"
                  value={email}
                />
                <TouchableOpacity
                  style={Styles.CheckDuplicateBtn}
                  onPress={handleCheckDuplicate}>
                  <Text style={Styles.BtnText}>중복확인</Text>
                </TouchableOpacity>
              </View>

              {/* ID 중복 에러 메시지 */}
              {emailError ? <Text style={Styles.error}>{emailError}</Text> : null}
              

              <Text style={Styles.text}>비밀번호</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput 
                  style={[Styles.TextInput, {flex: 1}]} 
                  onChangeText={setPassword}
                  placeholder="비밀번호"
                  placeholderTextColor="#D9D9D9"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ marginLeft: 10 }}>
                  <Icon name={isPasswordVisible ? "eye" : "eye-slash"} size={20} color="#000" />
                </TouchableOpacity>
              </View>
              

              {/* 비밀번호 오류 메시지 */}
              {passwordError ? <Text style={Styles.error}>{passwordError}</Text> : null}
            
              {/* 비밀번호 확인 입력칸 */}
              <Text style={Styles.text}>비밀번호 확인</Text>
              <TextInput 
                style={Styles.TextInput} 
                onChangeText={handleConfirmPassword}
                placeholder="비밀번호 확인"
                placeholderTextColor="#D9D9D9"
                secureTextEntry={true}
                value={confirmPassword}
              />

              {/* 비밀번호 일치 여부 에러 메시지 */}
              {confirmPasswordError ? <Text style={Styles.error}>{confirmPasswordError}</Text> : null}

              <Text style={Styles.text}>MBTI</Text>
              <TextInput
                style={Styles.TextInput}
                onChangeText={setmbti}
                placeholder="mbti"
                placeholderTextColor="#D9D9D9"
                value={mbti}
              />

              <Text style={Styles.text}>닉네임</Text>
              <TextInput 
                style={Styles.TextInput} 
                onChangeText={setNickname}
                placeholder="닉네임"
                placeholderTextColor="#D9D9D9"
                value={nickname}
              />

              <Text style={Styles.text}>성별</Text>
              <TextInput 
                style={Styles.TextInput} 
                onChangeText={setGender}
                placeholder="성별"
                placeholderTextColor="#D9D9D9"
                value={gender}
              />

              <Text style={Styles.text}>나이</Text>
              <TextInput 
                style={Styles.TextInput} 
                onChangeText={setAge}
                placeholder="나이"
                placeholderTextColor="#D9D9D9"
                value={age}
              />

              <Text style={Styles.text}>지역</Text>
              <TextInput 
                style={Styles.TextInput} 
                onChangeText={setregion}
                placeholder="지역"
                placeholderTextColor="#D9D9D9"
                value={region}
              />

              <Text style={Styles.text}>직업</Text>
              <TextInput 
                style={Styles.TextInput} 
                onChangeText={setJob}
                placeholder="직업"
                placeholderTextColor="#D9D9D9"
                value={job}
              />

              <Text style={Styles.text}>자기소개</Text>
              <TextInput 
                style={Styles.TextInput} 
                onChangeText={setIntroduce}
                placeholder="자기소개"
                placeholderTextColor="#D9D9D9"
                value={introduce}
              />


              <Text style={Styles.text}>생년월일</Text>
              {Platform.OS === 'android' && (
                <TouchableOpacity onPress={openDatePicker}>
                  <View style={Styles.birthDateContainer}>
                    <Text style={Styles.dateText}>{formattedBirthDate}</Text>
                  </View>
                </TouchableOpacity>
              )}
              {Platform.OS === 'ios' ? (
                <View style={Styles.iosBirthDateContainer}>
                  <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display="default"
                    onChange={onChange}
                  />
                </View>
              ):(
                showPicker && (
                  <DateTimePicker
                      value={birthDate}
                      mode="date"
                      display="default"
                      onChange={onChange}
                    />
                  )
              )}

              {/* 폼 오류 메시지(필수 항목 누락 등) */}
              {formError ? <Text style={Styles.error}>{formError}</Text> : null}

              {/* 회원가입 버튼 클릭 동작 */}
              <TouchableOpacity 
                style={Styles.SignUpBtn}
                onPress={handleSignUp}>
                <Text style={Styles.BtnText}>회원가입 완료</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{marginTop: 20}}
                onPress={() => navigation.navigate("LoginScreen")}>
                <Text style={Styles.LoginText}>로그인 화면으로</Text>
              </TouchableOpacity>
              </View>
            </ScrollView>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
}


export default SignUpScreen;

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoView:{
    justifyContent: 'center',  // 세로 중앙 정렬
    alignItems: 'center',      // 가로 중앙 정렬
  },
  logo: {
    width: 130,                 // 로고 너비
    height: 130,                // 로고 높이
    marginTop: "17%",           // 수직 위치 조정
    resizeMode: 'contain',      // 로고 크기를 너비와 높이에 맞게 조정
  },
  text:{
    color: '#2F4F4F'
  },
  RegisterView:{
    height: "63%",
    padding:20,
    margin: 35,
    marginTop:20,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ff5757',
    borderRadius: 6,
  },
  scrollContent: {
    flexGrow: 1, // 스크롤뷰 내용이 밀릴 수 있도록 설정
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  LogoText: {
    fontSize: 30,
    marginTop:30,
    textAlign: "center",
  },
  TextInput: {
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 35,
    borderRadius: 6,
    borderColor: '#ff5757',
    borderWidth: 1
  },
  SignUpBtn: {
    margin: 10,
    backgroundColor: "#ff5757",
    padding: 10,
    width: "100%",
    alignSelf: "center",
    borderRadius: 10
  },
  BtnText:{
    fontWeight: 'bold',
    textAlign: 'center',
    color:'white',
  },
  LoginText: {
    fontSize: 14,
    textAlign: 'center',
    color:'#ff5757',
    marginBottom: 15
  },
  CheckDuplicateBtn: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#ff5757',
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginTop: -5,
    marginBottom: 10,
  },
  birthDateContainer: {
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 7,
    backgroundColor: '#fa9393',
    marginRight: '55%',
    marginTop: 10,
    marginBottom: 15
  },
  dateText: {
    fontSize: 16,
    color: '#fff',
  },
  iosBirthDateContainer: {
    flexDirection: 'row', 
    alignItems: 'center',   
    marginBottom: 10,       
    marginTop: 10,
    marginLeft: -10
  },
})