import React, { useEffect, useState, } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import MainScreen from '../screens/MainScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SettingScreen from '../screens/Setting/SettingScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const TabBar = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#fff', // 탭바 배경색
          borderRadius: 20, // 둥글게 만들기
          marginHorizontal: 20, // 양쪽에 간격 추가
          marginBottom: Platform.OS === 'android' ? 10 : 15, // 아래쪽 간격
          elevation: 3, // 그림자 효과 (Android)
          shadowColor: '#000', // 그림자 색상 (iOS)
          shadowOffset: { width: 0, height: 2 }, // 그림자 위치 (iOS)
          shadowOpacity: 0.25, // 그림자 투명도 (iOS)
          shadowRadius: 3.84, // 그림자 반경 (iOS)
          height: Platform.OS === 'android' ? 55 : 57,
        },
        tabBarItemStyle: {
          borderRadius: 15, // 각 탭 아이템 둥글게
        },
        tabBarActiveTintColor: '#FF9AAB', // 활성 상태 아이템 색상
        tabBarInactiveTintColor: '#8e8e8e', // 비활성 상태 아이템 색상
      }}
    >
      <Tab.Screen 
          name="Home" 
          component={MainScreen}
          options={{
                  tabBarIcon: ({ color }) => <Icon name="home" size={20} color={color} />, // 아이콘 색상 설정
                  headerShown: false,
                }}
      />
      <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
                  tabBarIcon: ({ color }) => <Icon2 name="person-circle-outline" size={20} color={color} />, // 아이콘 색상 설정
                  headerShown: false,
                  }}
      />
      <Tab.Screen 
          name="Setting" 
          component={SettingScreen} 
          options={{
                  tabBarIcon: ({ color }) => <Icon2 name="settings-outline" size={20} color={color} />, // 아이콘 색상 설정
                  headerShown: false,
                  }}
      />
    </Tab.Navigator>
  );
};

export default TabBar;
