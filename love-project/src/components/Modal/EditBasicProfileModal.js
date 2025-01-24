import React from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const EditBasiccProfileModal = ({ visible, onClose, onSave, profileData, setProfileData, editItem, setEditItem }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* 제목(키)는 수정할 수 없도록 Text로 표시 */}
                    <Text style={styles.modalTitle}>{editItem?.key}</Text>
                    {/* 내용(값)만 수정 가능 */}
                    <TextInput
                        style={styles.textArea}
                        placeholder="내용을 작성해주세요."
                        value={editItem?.value}
                        onChangeText={(text) => setEditItem({ ...editItem, value: text })}
                        multiline={true}
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    <TouchableOpacity style={styles.addButton} onPress={() => onSave(editItem)}>
                        <Text style={styles.addButtonText}>저장</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        fontSize: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        borderRadius: 5,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
        height: 100, // 기본 높이 설정
    },
    addButton: {
        backgroundColor: '#9AAEFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    cancelButtonText: {
        color: '#333',
    },
});

export default EditBasiccProfileModal;
