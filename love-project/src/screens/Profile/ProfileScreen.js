import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons'; // Expo Icons 추가
import Icon2 from 'react-native-vector-icons/Feather';
import Icon3 from 'react-native-vector-icons/Ionicons'; 
import Icon4 from 'react-native-vector-icons/FontAwesome5';
import Icon5 from 'react-native-vector-icons/MaterialCommunityIcons'

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
                    <TouchableOpacity style={styles.editButton} onPress={() => {
                        setShowInput(!showEditButtons);
                        setShowEditButtons(!showEditButtons);
                    }}>
                        <Icon2 style={styles.editButtonText} name="edit-3" size={24} color="#9AAEFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.photoContainer}>
                    <Image
                        source={{ uri: 'https://example.com/profile.jpg' }} // 여기에 사진 URL을 추가하세요.
                        style={styles.profilePhoto}
                    />
                </View>

                <View>
                    <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("AvatarScreen")}>
                        <Icon2 style={styles.editButtonText} name="edit-3" size={24} color="#9AAEFF" />
                    </TouchableOpacity>
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
                
                {selectedIndex === 0 ? (
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
                            {showEditButtons && (
                                <TouchableOpacity onPress={() => handleDeleteInfo(index)} style={styles.deleteButton}>
                                    <Text style={styles.deleteButtonText}>삭제</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
                ) : (
                    <View style={styles.mediaContainer}>
                        <Text style={styles.mediaText}>여기에 사진 업로드 UI를 추가하세요.</Text>
                    </View>
                )}

            </ScrollView>

            {/* 새 정보 추가 입력 필드 */}
            {showEditButtons && (
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

            <View style={styles.appeal}>
                <Text style={styles.appealText}>어필하고 싶은 내용을 적어보세요!</Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 16,
        backgroundColor: '#F9F9F9',
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
        color: '#9AAEFF',
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
        borderColor: '#E0E0E0',
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    segment: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    activeSegment: {
        backgroundColor: '#FFFFFF',
    },
    inactiveSegment: {
        backgroundColor: '#E0E0E0',
    },
    segmentText: {
        fontWeight: '500',
    },
    activeText: {
        color: '#333',
        fontWeight: 'bold',
    },
    inactiveText: {
        color: '#666',
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
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
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
        elevation: 2,
        marginBottom: 10,
    },
    hobbyText: {
        fontSize: 16,
        color: '#444',
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
        marginRight: 10,
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
    appeal: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    appealText: {
        color: '#9AAEFF',
    },
});

export default ProfileScreen;
