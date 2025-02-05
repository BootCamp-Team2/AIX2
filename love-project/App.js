import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './src/screens/MainScreen';
import SplashScreenComponent from './src/screens/SplashScreen';
import CoordinationScreen from './src/screens/CoordinationScreen';
import ConversationScreen from './src/screens/Simulation/ConversationScreen';
import LoginScreen from './src/screens/LoginScreen';
import MatchingScreen from './src/screens/Matching/MatchingScreen';
import MatchingChatScreen from './src/screens/Matching/MatchingChatScreen';
import ModifyMatchInfo from './src/screens/Matching/ModifyMatchInfo';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import OpProfileScreen from './src/screens/Profile/OpProfileScreen';
import AvatarScreen from './src/screens/Profile/AvatarScreen';
import SettingScreen from './src/screens/SettingScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import IdealTypeImg from './src/screens/Simulation/IdealTypeImg';
import IdealTypeSet from './src/screens/Simulation/IdealTypeSet';
import MyCharacter from './src/screens/Profile/MyCharacter';
import TabBar from './src/components/TabBar';
import MatchingList from './src/screens/Matching/MatchingList';
import AIchat from './src/screens/Simulation/AIchat.js';
import AssistantSelect from './src/screens/Simulation/AssistantSelect';
import Login from './src/screens/Login.js';
import CoachingScreen from './src/screens/Simulation/CoachingScreen.js';
import ChatchatScreen from './src/screens/Matching/ChatchatScreen'; // ChatchatScreen 임포트
import ChattingList from './src/screens/ChattingList';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createStackNavigator(); // 스택 내비게이션 생성

const App = () => {
  return (
    <MainNavigator />
  );
};

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen" // 초기 화면을 스플래시 스크린으로 설정
        screenOptions={{
          headerShown: true, // 모든 화면에서 헤더 보이기
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreenComponent} // 스플래시 스크린 추가
          options={{ headerShown: false}} // 헤더 숨기기
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen} // 로그인 화면 추가
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainScreen"
          component={TabBar}
          options={{ headerShown: false, headerTitle: '메인 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OpProfileScreen"
          component={OpProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SettingScreen"
          component={SettingScreen}
          options={{ headerTitle: '설정 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="MatchingList"
          component={MatchingList}
          options={{ headerTitle: '매칭 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="MatchingScreen"
          component={MatchingScreen}
          options={{ headerTitle: '매칭 화면', headerTitleAlign: 'center', headerStyle: { backgroundColor: '#FFF0F0' } }}
        />
        <Stack.Screen
          name="ModifyMatchInfo"
          component={ModifyMatchInfo}
          options={{ headerTitle: '매칭 정보 수정', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="MatchingChatScreen"
          component={MatchingChatScreen}
          options={{ headerTitle: '코디 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="ConversationScreen"
          component={ConversationScreen}
          options={{ headerTitle: 'AI 대화 시뮬레이션 화면', headerTitleAlign: 'center', headerStyle: { backgroundColor: '#FFE4D9' }}}
        />
        <Stack.Screen
          name="CoordinationScreen"
          component={CoordinationScreen}
          options={{ headerTitle: 'AI 스타일 코디 화면', headerTitleAlign: 'center', headerStyle: { backgroundColor: '#d1e8d9' } }}
        />
        <Stack.Screen
          name="IdealTypeImg"
          component={IdealTypeImg}
          options={{ headerTitle: '이상형 이미지 생성 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="IdealTypeSet"
          component={IdealTypeSet}
          options={{ headerTitle: '이상형 이미지 설정 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="MyCharacter"
          component={MyCharacter}
          options={{ headerTitle: '캐릭터 생성', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="AvatarScreen"
          component={AvatarScreen}
          options={{ headerTitle: '아바타 생성', headerTitleAlign: 'center', headerStyle: { backgroundColor: '#d9e0fc' } }}
        />
        <Stack.Screen
          name="AIchat"
          component={AIchat}
          options={{ headerTitle: '챗봇과 채팅', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="AssistantSelect"
          component={AssistantSelect}
          options={{ headerTitle: '챗봇 선택', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="CoachingScreen"
          component={CoachingScreen}
          options={{ headerTitle: '연애 상담', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="TabBar"
          component={TabBar}
          options={{ headerShown: false, headerTitle: '', headerTitleAlign: 'center' }}
        />
        
        {/* ChatchatScreen을 네비게이터에 추가 */}
        <Stack.Screen
          name="ChatchatScreen"
          component={ChatchatScreen}
          options={{ headerTitle: '채팅 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="ChattingList"
          component={ChattingList}
          options={{ headerTitle: '채팅 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{ headerTitle: '채팅 화면', headerTitleAlign: 'center' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;