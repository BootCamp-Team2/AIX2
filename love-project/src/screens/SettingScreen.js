import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LogoutModal from '../components/Modal/LogoutModal.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
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

  return (
    <View style={styles.container}>
      <View style={[styles.section, { marginTop: 35 }]}>
        <MaterialIcons name="settings" size={24} color="#FF9AAB" /> 
        <Text style={[styles.label, styles.labelSpacing]}>앱 설정</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={styles.buttonContainer}>
          <Button 
            title="로그아웃" 
            color="gray" 
            onPress={() => setLogoutModalVisible(true)} 
          />
          <Button 
            title="회원탈퇴" 
            color="gray" 
            onPress={() => setDeleteModalVisible(true)} 
          />
        </View>
      </View>

      <LogoutModal 
        visible={logoutModalVisible} 
        onClose={() => setLogoutModalVisible(false)} 
        onConfirm={handleLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  labelSpacing: {
    marginLeft: 10,
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
});

export default SettingsScreen;