import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './src/screens/MainScreen';
import SplashScreen from './src/screens/SplashScreen';
import CoordinationScreen from './src/screens/CoordinationScreen';
import ConversationSelect from './src/screens/Simulation/ConversationSelect';
import ConversationScreen from './src/screens/Simulation/ConversationScreen';
import DatingAssistant from './src/screens/Simulation/DatingAssistant';
import LoginScreen from './src/screens/LoginScreen';
import MatchingScreen from './src/screens/Matching/MatchingScreen';
import MatchingChatScreen from './src/screens/Matching/MatchingChatScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import AvatarScreen from './src/screens/Profile/AvatarScreen';
import SettingScreen from './src/screens/SettingScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import IdealTypeImg from './src/screens/Simulation/IdealTypeImg';
import IdealTypeSet from './src/screens/Simulation/IdealTypeSet';
import MyCharacter from './src/screens/Profile/MyCharacter';
import TabBar from './src/components/TabBar';

const Stack = createStackNavigator(); // 스택 내비게이션 생성

const App = () => {
  return <MainNavigator />;
};

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainScreen" // 초기 화면 설정
        screenOptions={{
          headerShown: true, // 기본 헤더 보이기
          headerTitleAlign: 'center', // 헤더 제목 가운데 정렬
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen} // 스플래시 화면
          options={{ headerShown: false }} // 헤더 숨기기
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen} // 로그인 화면
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen} // 회원가입 화면
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainScreen"
          component={TabBar} // 메인 화면
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen} // 프로필 화면
        />
        <Stack.Screen
          name="SettingScreen"
          component={SettingScreen} // 설정 화면
          options={{ headerTitle: '설정 화면' }}
        />
        <Stack.Screen
          name="MatchingScreen"
          component={MatchingScreen} // 매칭 화면
          options={{ headerTitle: '매칭 화면' }}
        />
        <Stack.Screen
          name="MatchingChatScreen"
          component={MatchingChatScreen} // 매칭 채팅 화면
          options={{ headerTitle: '매칭 채팅 화면' }}
        />
        <Stack.Screen
          name="ConversationSelect"
          component={ConversationSelect} // AI 대화 선택 화면
          options={{ headerTitle: 'AI 대화 선택' }}
        />
        <Stack.Screen
          name="ConversationScreen"
          component={ConversationScreen} // AI 대화 화면
          options={{ headerTitle: 'AI 대화' }}
        />
        <Stack.Screen
          name="DatingAssistant"
          component={DatingAssistant} // 연애 코칭 화면
          options={{ headerTitle: '연애 코칭' }}
        />
        <Stack.Screen
          name="CoordinationScreen"
          component={CoordinationScreen} // 코디 화면
          options={{ headerTitle: '코디 화면' }}
        />
        <Stack.Screen
          name="IdealTypeImg"
          component={IdealTypeImg} // 이상형 이미지 생성
          options={{ headerTitle: '이상형 이미지' }}
        />
        <Stack.Screen
          name="IdealTypeSet"
          component={IdealTypeSet} // 이상형 이미지 설정
          options={{ headerTitle: '이상형 설정' }}
        />
        <Stack.Screen
          name="MyCharacter"
          component={MyCharacter} // 캐릭터 생성
          options={{ headerTitle: '캐릭터 생성' }}
        />
        <Stack.Screen
          name="AvatarScreen"
          component={AvatarScreen} // 아바타 생성
          options={{ headerTitle: '아바타 생성' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
