import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

const BasicModal = ({ visible, onClose, title, children, onConfirm }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.content}>
            {children}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  content: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5, 
    backgroundColor: '#ccc',
  },
  cancelText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#595858'
  },
  confirmButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    backgroundColor: '#d94e66',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BasicModal;
