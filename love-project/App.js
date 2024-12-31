import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './src/screens/MainScreen';
import SplashScreenComponent from './src/screens/SplashScreen';
import CoordinationScreen from './src/screens/CoordinationScreen';
import ConversationScreen from './src/screens/ConversationScreen';
import LoginScreen from './src/screens/LoginScreen';
import MatchingScreen from './src/screens/MatchingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingScreen from './src/screens/SettingScreen';
import SingUpScreen from './src/screens/SignUpScreen';

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
        initialRouteName="MainScreen" // 초기 화면을 스플래시 스크린으로 설정
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
          options={{ headerShown: false}}
        />
        <Stack.Screen
          name="MainScreen"
          component={MainScreen}
          options={{ headerTitle: '메인 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="SingUpScreen"
          component={SingUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ headerTitle: '프로필 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="SettingScreen"
          component={SettingScreen}
          options={{ headerTitle: '설정 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="MatchingScreen"
          component={MatchingScreen}
          options={{ headerTitle: '매칭 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="ConversationScreen"
          component={ConversationScreen}
          options={{ headerTitle: 'AI 대화 시뮬레이션 화면', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="CoordinationScreen"
          component={CoordinationScreen}
          options={{ headerTitle: '코디 화면', headerTitleAlign: 'center' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;