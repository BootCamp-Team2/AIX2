import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LogoutModal from '../../components/Modal/LogoutModal.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AccountDeletionModal from '../../components/Modal/AccountDeletionModal.js';
import { useNavigation } from '@react-navigation/native';
import Icon1 from 'react-native-vector-icons/AntDesign'
import Icon2 from 'react-native-vector-icons/Feather';
import Icon3 from 'react-native-vector-icons/Ionicons'; 
import Icon4 from 'react-native-vector-icons/FontAwesome5';
import Icon5 from 'react-native-vector-icons/MaterialCommunityIcons';

const AccountScreen = () => {
  const navigation = useNavigation(); // 네비게이션 가져오기
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const closeModal = () => {
    setLogoutModalVisible(false);
    setDeleteModalVisible(false);
  };

  const handleLogout = async () => {
    try {
      // AsyncStorage에서 토큰 삭제
      await AsyncStorage.removeItem('token'); 
      console.log('로그아웃 처리 완료');
      Alert.alert("로그아웃", "정상적으로 로그아웃되었습니다."); // 로그아웃 완료 메시지
      navigation.navigate('LoginScreen'); // 로그인 화면으로 리디렉션
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    } finally {
      setLogoutModalVisible(false); // 로그아웃 모달 닫기
    }
  };

  const handleAccountDeletion = async () => {
    try {
      // 예시: API 요청 - 실제 URL과 헤더는 서버에 맞게 수정
      const response = await fetch('https://your-api-url.com/delete-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`, // 토큰 인증
        },
      });
  
      if (response.ok) {
        // 토큰 삭제 및 성공 메시지
        await AsyncStorage.removeItem('token');
        Alert.alert("회원탈퇴 완료", "정상적으로 탈퇴 처리되었습니다.");
        navigation.navigate('LoginScreen'); // 로그인 화면으로 리디렉션
      } else {
        Alert.alert("오류", "회원탈퇴 중 문제가 발생했습니다.");
      }
    } catch (error) {
      console.error('회원탈퇴 중 오류:', error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    } finally {
      setDeleteModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingBox} onPress={() => setLogoutModalVisible(true)}>
        <Text style={styles.title}>로그아웃</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingBox} onPress={() => setDeleteModalVisible(true)}>
        <Text style={styles.title}>회원탈퇴</Text>
      </TouchableOpacity>

      <LogoutModal 
        visible={logoutModalVisible} 
        onClose={() => setLogoutModalVisible(false)} 
        onConfirm={handleLogout}
      />
      <AccountDeletionModal 
        visible={deleteModalVisible} 
        onClose={closeModal} 
        onConfirm={handleAccountDeletion}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  labelSpacing: {
    marginLeft: 20,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10, // 섹션 간 간격 통일
  },
  label: {
    fontSize: 24,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    justifyContent: 'center',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingBox: {
    backgroundColor: '#fff',
    width: '100%',
    height: 55,
    justifyContent: 'center',
    flexDirection: 'row',       // 가로 배치
    alignItems: 'center',       // 수직 중앙 정렬
    justifyContent: 'space-between', // 양쪽 끝 정렬
    paddingLeft: 27,
    marginTop: 10
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16
  },
  switch: {
    marginRight: 10
  }
});

export default AccountScreen;