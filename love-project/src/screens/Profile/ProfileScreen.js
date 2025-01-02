import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [selectedIndex, setSelectedIndex] = useState(0); // 선택된 인덱스 상태
    const [profileData, setProfileData] = useState({
        mbti: 'ENFP',
        age: '25',
        location: '서울',
        hobby: '독서',
        favoriteAnimal: '고양이',
    });

    const [newInfo, setNewInfo] = useState({ title: '', value: '' });
    const [additionalInfo, setAdditionalInfo] = useState([]);
    const [showInput, setShowInput] = useState(false); // 추가 정보 입력 필드 보이기 상태
    const [showEditButtons, setShowEditButtons] = useState(false); // 수정 버튼 보이기 상태

    const handleAddInfo = () => {
        if (newInfo.title && newInfo.value) {
            setAdditionalInfo([...additionalInfo, { title: newInfo.title, value: newInfo.value }]);
            setNewInfo({ title: '', value: '' }); // 입력 필드 초기화
            setShowInput(false); // 입력 필드 숨기기
        } else {
            Alert.alert("오류", "모든 필드를 입력해주세요.");
        }
    };

    const handleDeleteInfo = (index) => {
        const updatedInfo = additionalInfo.filter((_, i) => i !== index);
        setAdditionalInfo(updatedInfo);
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS와 Android에 따라 키보드 회피 방식 설정
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                keyboardShouldPersistTaps='handled' // 키보드가 올라갔을 때 스크롤 유지
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>홍길동 님의 프로필</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => { setShowInput(!showInput); setShowEditButtons(!showEditButtons); }}>
                        <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.photoContainer}>
                    <Image
                        source={{ uri: 'https://example.com/profile.jpg' }} // 여기에 사진 URL을 추가하세요.
                        style={styles.profilePhoto}
                    />
                </View>

                <View style={styles.segmentedControl}>
                    <TouchableOpacity
                        style={[styles.segment, selectedIndex === 0 ? styles.activeSegment : styles.inactiveSegment]}
                        onPress={() => setSelectedIndex(0)}
                    >
                        <Text style={[styles.segmentText, selectedIndex === 0 ? styles.activeText : styles.inactiveText]}>정보</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segment, selectedIndex === 1 ? styles.activeSegment : styles.inactiveSegment]}
                        onPress={() => setSelectedIndex(1)}
                    >
                        <Text style={[styles.segmentText, selectedIndex === 1 ? styles.activeText : styles.inactiveText]}>미디어</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoContainer}>
                    {/* 상단 정보 배치: MBTI, 나이, 지역을 가로로 배치 */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>{profileData.mbti}</Text>
                            {showEditButtons && (
                                <TouchableOpacity onPress={() => Alert.alert("수정 기능")}>
                                    <Text style={styles.editButtonText}>수정</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>나이: {profileData.age}</Text>
                            {showEditButtons && (
                                <TouchableOpacity onPress={() => Alert.alert("수정 기능")}>
                                    <Text style={styles.editButtonText}>수정</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>지역: {profileData.location}</Text>
                            {showEditButtons && (
                                <TouchableOpacity onPress={() => Alert.alert("수정 기능")}>
                                    <Text style={styles.editButtonText}>수정</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* 하단에 취미와 좋아하는 동물 배치 */}
                    <View style={styles.hobbyBox}>
                        <Text style={styles.hobbyText}>취미: {profileData.hobby}</Text>
                        {showEditButtons && (
                            <TouchableOpacity onPress={() => Alert.alert("수정 기능")}>
                                <Text style={styles.editButtonText}>수정</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.hobbyBox}>
                        <Text style={styles.hobbyText}>좋아하는 동물: {profileData.favoriteAnimal}</Text>
                        {showEditButtons && (
                            <TouchableOpacity onPress={() => Alert.alert("수정 기능")}>
                                <Text style={styles.editButtonText}>수정</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* 추가 정보 리스트 */}
                    {additionalInfo.map((item, index) => (
                        <View style={styles.hobbyBox} key={index}>
                            <Text style={styles.hobbyText}>{item.title}: {item.value}</Text>
                            {showEditButtons && (
                                <TouchableOpacity onPress={() => Alert.alert("수정 기능")}>
                                    <Text style={styles.editButtonText}>수정</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => handleDeleteInfo(index)} style={styles.deleteButton}>
                                <Text style={styles.deleteButtonText}>삭제</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* 새 정보 추가 입력 필드 */}
            {showInput && (
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="제목을 작성해주세요."
                        value={newInfo.title}
                        onChangeText={(text) => setNewInfo({ ...newInfo, title: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="내용을 작성해주세요."
                        value={newInfo.value}
                        onChangeText={(text) => setNewInfo({ ...newInfo, value: text })}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddInfo}>
                        <Text style={styles.addButtonText}>추가</Text>
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 16,
        backgroundColor: '#F9F9F9', // 배경 색상
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 50,
        marginLeft: 85,
        color: '#333', // 텍스트 색상
    },
    editButton: {
        marginLeft: 10,
    },
    editButtonText: {
        marginTop: 50,
        fontSize: 24,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#E0E0E0', // 사진 테두리 색상
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF', // 배경 색상
        borderRadius: 5,
        marginBottom: 20,
        shadowColor: '#000', // 그림자 색상
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, // 안드로이드에서 그림자 효과
        overflow: 'hidden', // 둥글게 만들기 위해 추가
    },
    segment: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5, // 둥글게 만들기
    },
    activeSegment: {
        backgroundColor: '#FFFFFF', // 선택된 버튼의 배경색 (하얀색)
    },
    inactiveSegment: {
        backgroundColor: '#E0E0E0', // 눌리지 않은 버튼의 배경색 (회색)
    },
    segmentText: {
        fontWeight: '500',
    },
    activeText: {
        color: '#333', // 선택된 버튼의 텍스트 색상
        fontWeight: 'bold',
    },
    inactiveText: {
        color: '#666', // 눌리지 않은 버튼의 텍스트 색상 (회색)
    },
    infoContainer: {
        marginTop: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    infoBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, // 안드로이드에서 그림자 효과
        flex: 1, // 박스가 동일한 너비를 가지도록 설정
        marginHorizontal: 5, // 박스 간격
    },
    infoText: {
        fontSize: 16,
        color: '#444', // 정보 텍스트 색상
        textAlign: 'center', // 텍스트 중앙 정렬
    },
    hobbyBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, // 안드로이드에서 그림자 효과
        marginBottom: 10, // 박스 간격
    },
    hobbyText: {
        fontSize: 16,
        color: '#444', // 취미 및 동물 텍스트 색상
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginRight: 10, // 입력 필드 간 간격
    },
    addButton: {
        backgroundColor: '#FF6F61',
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    deleteButton: {
        marginTop: 5,
        backgroundColor: '#FF6F61',
        borderRadius: 5,
        padding: 5,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
