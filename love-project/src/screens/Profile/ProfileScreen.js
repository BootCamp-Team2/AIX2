import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons'; // Expo Icons 추가
import * as ImagePicker from 'expo-image-picker'; // ImagePicker 추가
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
    const [nickname, setNickname] = useState('OOO');
    const [additionalInfo, setAdditionalInfo] = useState([]);
    const [showInput, setShowInput] = useState(false); // 추가 정보 입력 필드 보이기 상태
    const [showEditButtons, setShowEditButtons] = useState(false); // 수정 버튼 보이기 상태
    const [isCircleFront, setIsCircleFront] = useState(false);
    const [profilePhotoUri, setProfilePhotoUri] = useState(null); // 프로필 사진 URI 상태
    const [editMode, setEditMode] = useState(null); // 수정 모드 (수정 중인 항목의 인덱스를 저장)

    useFocusEffect(
        React.useCallback(() => {
          const fetchUserData = async () => {
            try {
              const userInfo = await fetchUserInfo();
              setNickname(userInfo.nickname);
              setEmail(userInfo.id);
            } catch (error) {
              console.error('사용자 정보 가져오기 실패:', error);
            }
          };
    
          fetchUserData(); // 화면 포커스 시 사용자 데이터 가져오기
    
          // 클린업 함수 (필요할 경우)
          return () => {
            // 정리 작업이 필요하다면 여기에 작성
          };
        }, [])
      );

    // 수정된 내용을 저장하는 함수
    const handleSaveEdit = (key, value) => {
        if (key in profileData) {
            setProfileData({ ...profileData, [key]: value }); // 기본 프로필 데이터 수정
        } else {
            const updatedInfo = [...additionalInfo];
            updatedInfo[editMode].value = value;
            setAdditionalInfo(updatedInfo); // 추가 정보 수정
        }
    };
    
    

    // 사진 선택 함수
    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('사진 접근 권한이 필요합니다!');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!pickerResult.cancelled) {
            alert('set profile photo!');
            setProfilePhotoUri(pickerResult.assets[0].uri); // 선택한 사진을 상태에 저장
            alert('completed to set profile photo!');
        }else{
            alert('cancelled!');
        }
    };

    const handleAddInfo = () => {
        if (newInfo.title && newInfo.value) {
            setAdditionalInfo([...additionalInfo, { title: newInfo.title, value: newInfo.value }]);
            setNewInfo({ title: '', value: '' }); // 입력 필드 초기화
        } else {
            Alert.alert("오류", "모든 필드를 입력해주세요.");
        }
    };
    const handleSwitch = () => {
        setIsCircleFront(!isCircleFront); // 상태 스위치
    };

    const handleDeleteInfo = (index) => {
        const updatedInfo = additionalInfo.filter((_, i) => i !== index);
        setAdditionalInfo(updatedInfo);
    };

    // 수정 버튼 클릭 핸들러
const handleEditButtonPress = () => {
    if (editMode !== null) {
        setEditMode(null); // 수정 중인 항목이 있으면 수정 취소
    } else {
        setShowEditButtons(!showEditButtons); // 수정 버튼 상태 토글
    }
};


    // 수정 모드를 종료하는 함수
    const handleCloseEditMode = () => {
        // 수정 모드 취소 시 원래 값으로 복원
        if (editMode !== null) {
            // 수정한 데이터가 있으면 원래 값으로 롤백
            if (profileData[editMode]) {
                setProfileData(prevState => ({
                    ...prevState,
                    [editMode]: prevState[editMode], // 원래 값으로 롤백
                }));
            } else if (additionalInfo[editMode]) {
                const updatedInfo = [...additionalInfo];
                updatedInfo[editMode].value = updatedInfo[editMode].value; // 원래 값으로 롤백
                setAdditionalInfo(updatedInfo);
            }
        }
    
        setEditMode(null); // 수정 모드 종료
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
                    <Text style={styles.headerText}>{nickname} 님의 프로필</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => {
                        setShowInput(!showEditButtons);
                        setShowEditButtons(!showEditButtons);
                        handleEditButtonPress();
                    }}>
                        <Icon2 style={styles.editButtonText} name="edit-3" size={24} color="#9AAEFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.photoContainer}>
                    {/* 프로필 사진 */}
                    <Image
                        source={profilePhotoUri ? { uri: profilePhotoUri } : require('../../../assets/testProfile/kimgoeunProfile.png')} // 기본 이미지 설정
                        style={[
                            styles.profilePhoto,
                            {
                                zIndex: isCircleFront ? 0 : 1,
                                left: isCircleFront ? 155 : 115, 
                                width: isCircleFront ? 80 : 100,
                                height: isCircleFront ? 80 : 100,
                                top: isCircleFront ? 10 : 0,
                            },
                        ]}
                    />
                    {/* 겹치는 원 */}
                    <Image
                        source={{ uri: 'https://example.com/profile.jpg' }}
                        style={[
                            styles.overlappingCircle,
                            {
                                zIndex: isCircleFront ? 1 : 0,
                                left: isCircleFront ? 115 : 155,
                                width: isCircleFront ? 100 : 80,
                                height: isCircleFront ? 100 : 80,
                                top: isCircleFront ? 0 : 10,
                            },
                        ]}
                    />
                    {/* 프로필 변경 버튼 */}
                    <TouchableOpacity style={styles.switchButton} onPress={handleSwitch}>
                        <Icon5 style={styles.switchText} name="account-convert-outline" size={24} color="#9AAEFF" />
                    </TouchableOpacity>
                </View>



                <View>
                    {isCircleFront === true && ( // overlappingCircle이 왼쪽에 있을 때만 렌더링
                        <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate("AvatarScreen")}>
                            <Text style={styles.avatarText}>캐릭터 생성하기</Text>
                        </TouchableOpacity>
                    )}
                    {showEditButtons && isCircleFront === false && ( // showEditButtons가 true일 때만 '프로필 추가' 버튼 표시
                        <TouchableOpacity style={styles.avatarButton} onPress={handlePickImage}>
                            <Text style={styles.avatarText}>프로필 추가</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.avatarButtonPlaceholder}>
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
                    {/* MBTI, 나이, 지역만 가로로 배치 */}
                    <View style={styles.infoRow}>
                        {['mbti', 'age', 'location'].map((key) => (
                            <View key={key} style={styles.infoBox}>
                                {editMode === key ? (
                                    <TextInput
                                        style={styles.input}
                                        value={profileData[key]}
                                        onChangeText={(text) => handleSaveEdit(key, text)}
                                    />
                                ) : (
                                    <Text style={styles.infoText}>{key}: {profileData[key]}</Text>
                                )}
                                {showEditButtons && (
    editMode === key ? (
        <TouchableOpacity onPress={() => { handleSaveEdit(key, profileData[key]); handleCloseEditMode(); }}>
            <Text style={styles.editButtonText}>저장</Text>
        </TouchableOpacity>
    ) : (
        <TouchableOpacity onPress={() => setEditMode(key)}>
            <Text style={styles.editButtonText}>수정</Text>
        </TouchableOpacity>
    )
)}
                            </View>
                        ))}
                    </View>

                    {/* 나머지 프로필 정보 */}
                    {Object.entries(profileData).map(([key, value]) => (
                        key !== 'mbti' && key !== 'age' && key !== 'location' && (
                            <View style={styles.hobbyBox}>
                                {editMode === key ? (
                                    <TextInput
                                        style={styles.input}
                                        value={value}
                                        onChangeText={(text) => handleSaveEdit(key, text)}
                                    />
                                ) : (
                                    <Text style={styles.infoText}>{key}: {value}</Text>
                                )}
                                {showEditButtons && (
                                    editMode === key ? (
                                        <TouchableOpacity onPress={() => setEditMode(null)}>
                                            <Text style={styles.editButtonText}>저장</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity onPress={() => setEditMode(key)}>
                                            <Text style={styles.editButtonText}>수정</Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>
                        )
                    ))}
                            
                    {/* 추가 정보 수정 UI */}
                    {additionalInfo.map((item, index) => (
                        <View key={index} style={styles.hobbyBox}>
                            {editMode === index ? (
                                <TextInput
                                    style={styles.input}
                                    value={item.value}
                                    onChangeText={(text) => handleSaveEdit(null, text)}
                                />
                            ) : (
                                <Text style={styles.hobbyText}>{item.title}: {item.value}</Text>
                            )}
                            {showEditButtons && (
                                editMode === index ? (
                                    <TouchableOpacity onPress={() => setEditMode(null)}>
                                        <Text style={styles.editButtonText}>저장</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => setEditMode(index)}>
                                        <Text style={styles.editButtonText}>수정</Text>
                                    </TouchableOpacity>
                                )
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
        flexDirection: 'row',
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        marginBottom: 10,
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
        flex: 1,  // 부모 컨테이너에서 공간을 고르게 나누기
        justifyContent: 'center',  // 수직 중앙 정렬
        alignItems: 'center',  // 수평 중앙 정렬
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
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
        flex: 1,  // 부모 컨테이너에서 공간을 고르게 나누기
        justifyContent: 'center',  // 수직 중앙 정렬
        alignItems: 'center',  // 수평 중앙 정렬
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
        marginBottom: 10,
    },
    hobbyText: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
    },
    basicHobbyBox: {
        width: 100
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    input: {
        width: '100%',
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
    avatarText:{
        color: '#9AAEFF',
    },
    avatarButton: {
        borderWidth: 2,           // Sets the border width
        borderColor: '#9AAEFF',      // Sets the border color to blue
        borderRadius: 10,         // Optional: Adds rounded corners
        padding: 7,              // Optional: Adds padding inside the button
        alignItems: 'center',     // Centers text inside the button
        justifyContent: 'center', // Centers text vertically
        backgroundColor: 'white', // Optional: Sets background color
        width: '35%',
        marginBottom: -37,
        bottom: 30 
    },
    switchButton: {
        position: 'absolute', // 절대 위치로 설정
        right: 30, // 원의 오른쪽으로 버튼 이동
        top: '85%', // 원의 수직 중앙에 배치
        transform: [{ translateY: -12 }], // 버튼 크기의 절반만큼 위로 이동하여 중앙 정렬
        backgroundColor: 'white', // 선택사항: 버튼 배경색
        padding: 5, // 선택사항: 여백 추가
        borderRadius: 15, // 선택사항: 둥근 버튼
        elevation: 5, // 선택사항: 그림자 효과
    },
    photoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: 120, // 고정 높이를 설정하여 아래 UI가 올라오지 않도록 유지
    },
    profilePhoto: {
        width: 100, 
        height: 100,
        borderRadius: 50, // 원형으로 만들기
        position: 'absolute', // 레이아웃 흐름에서 제외
    },
    overlappingCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderColor: '#E0E0E0',
        backgroundColor: '#E0E0E0',
        position: 'absolute', // 레이아웃 흐름에서 제외
    },
    avatarButtonPlaceholder: {
        width: '35%', // 버튼과 같은 넓이
        height: 10, // 버튼의 높이에 맞춰 고정
        marginBottom: 17, // 버튼의 마진과 일치
    },
    
});

export default ProfileScreen;
