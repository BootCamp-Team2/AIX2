import React from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const EditProfileModal = ({ visible, onClose, onSave, editItem, setEditItem }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <TextInput
                        style={styles.input}
                        placeholder="제목을 작성해주세요."
                        value={editItem?.title}
                        onChangeText={(text) => setEditItem({ ...editItem, title: text })}
                    />
                    <TextInput
                        style={styles.textArea}
                        placeholder="내용을 작성해주세요."
                        value={editItem?.value}
                        onChangeText={(text) => setEditItem({ ...editItem, value: text })}
                        multiline={true} // 줄바꿈 허용
                        numberOfLines={4} // 기본 높이 설정
                        textAlignVertical="top" // 텍스트 정렬 (위쪽 정렬)
                    />
                    <TouchableOpacity style={styles.addButton} onPress={() => onSave(editItem.title, editItem.value)}>
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

export default EditProfileModal;
