import React from 'react';
import { Text, StyleSheet } from 'react-native';
import BasicModal from './BasicModal';

const LogoutModal = ({ visible, onClose, onConfirm }) => {
  return (
    <BasicModal 
      visible={visible} // 모달의 열기/닫기 상태
      onClose={onClose}
      onConfirm={onConfirm}
      title="로그아웃"
    >

      <Text style={styles.message}>로그아웃하시겠습니까?</Text>
    </BasicModal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
    message: {
    fontSize: 18, 
    textAlign: 'center', 
    marginVertical: 20,
    color: '#2F4F4F',
    },
});