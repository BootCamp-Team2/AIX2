import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, FlatList, Modal, LogBox } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons'; // Expo Icons 추가
import * as ImagePicker from 'expo-image-picker'; // ImagePicker 추가
import Icon2 from 'react-native-vector-icons/Feather';
import Icon3 from 'react-native-vector-icons/Ionicons'; 
import Icon4 from 'react-native-vector-icons/FontAwesome5';
import Icon5 from 'react-native-vector-icons/MaterialCommunityIcons';
import AddProfileModal from '../../components/Modal/AddProfileModal';
import EditProfileModal from '../../components/Modal/EditProfileModal';
import EditBasiccProfileModal from '../../components/Modal/EditBasicProfileModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';

LogBox.ignoreLogs([
    'VirtualizedLists should never be nested', // 이 경고 메시지 무시
]);

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [selectedIndex, setSelectedIndex] = useState(0); // 선택된 인덱스 상태
    const [profileData, setProfileData] = useState({});

    const [newInfo, setNewInfo] = useState({ title: '', value: '' });
    const [additionalInfo, setAdditionalInfo] = useState([]);
    const [showInput, setShowInput] = useState(false); // 추가 정보 입력 필드 보이기 상태
    const [showEditButtons, setShowEditButtons] = useState(false); // 수정 버튼 보이기 상태
    const [isCircleFront, setIsCircleFront] = useState(false);
    const [editMode, setEditMode] = useState(null); // 수정 모드 (수정 중인 항목의 인덱스를 저장)
    const [mediaList, setMediaList] = useState([]); // 업로드된 미디어 리스트 상태
    const [numColumns, setNumColumns] = useState(2); // numColumns 상태 관리
    const [modalVisible, setModalVisible] = useState(false); // 모달 상태
    const [editItem, setEditItem] = useState(null); // 편집할 항목 데이터
    const [profileImg, setProfileImg] = useState(null);
    const [avatarImg, setAvatarImg] = useState(null);
    const [addProfileModalVisible, setAddProfileModalVisible] = useState(false); // 추가 모달 상태
    const [editProfileModalVisible, setEditProfileModalVisible] = useState(false); // 수정 모달 상태
    const [editBasicProfileModalVisible, setEditBasicProfileModalVisible] = useState(false); // 기본 정보 수정 모달 상태

    const [userData, setUserData] = useState({});
    useEffect(() => {
        const loadUserData = async () => {
            setUserData(JSON.parse(await AsyncStorage.getItem('userData')));
        };

        loadUserData();
    }, []);

    useEffect(() => {
        const checkUserData = async () => {
            const storedData = await AsyncStorage.getItem('userData');
            if (storedData && JSON.stringify(userData) !== storedData) {
                console.log('🔄 변경 감지: 데이터 다시 불러오기');
                setUserData(JSON.parse(storedData));
            }
        };
    
        const interval = setInterval(checkUserData, 3000); // 🔄 3초마다 확인
        return () => clearInterval(interval); // 🔹 컴포넌트 언마운트 시 정리
    }, [userData]);

    useEffect(() => {
        const loadProfileData = () => {
            if(!userData) return;

            setProfileData({
                username: userData.username,
                MBTI: userData.mbti,
                나이: userData.age ?? '20',
                지역: userData.region,
                직업: userData.job ?? '무직',
                자기소개: userData.introduce ?? '안녕하세요~',
            });

            setProfileImg(userData.profilePicture ?? null);

            const timestamp = new Date().getTime();
            const newAvatarUri = `${userData.characterPicture}?t=${timestamp}`;
            setAvatarImg(userData.characterPicture ? newAvatarUri : null);

            setMediaList(userData.media ? JSON.parse(userData.media) : []);
            setAdditionalInfo(userData.appeal ? JSON.parse(userData.appeal) : []);
        };

        loadProfileData();
    }, [userData]);

    const handleReload = () => {
        window.location.reload();
    };

    // 수정 버튼을 눌렀을 때 저장 처리
    const handleSaveEdit = async (title, value) => {
        if (editMode !== null) {
            // 수정된 항목 업데이트 (상태 업데이트 전)
            const updatedInfo = [...additionalInfo];
            updatedInfo[editMode] = { title, value };
    
            // 비동기 API 호출
            await axios.post("http://192.168.1.27:8080/users/updateAppeal", { appeal: JSON.stringify(updatedInfo) },
                { headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${await AsyncStorage.getItem('token')}` }}
            );
    
            // API 호출 후 상태 업데이트
            setAdditionalInfo(updatedInfo);
        } else {
            // 기본 정보 수정
            const newProfileData = { ...profileData, [title]: value };
            console.log(newProfileData);
            setProfileData((profileData) => ({
                ...profileData,
                [title]: value,
            }));
        }
    
        // 모달 닫기
        setEditBasicProfileModalVisible(false);
        setEditProfileModalVisible(false);
        setAddProfileModalVisible(false);
    };

    const handleBasicSaveEdit = async (updatedItem) => {
        const newProfileData = {
            ...profileData,
            [updatedItem.key]: updatedItem.value, // 키는 유지하고 값만 업데이트
        };

        await axios.post("http://192.168.1.27:8080/users/updateProfile", newProfileData,
            { headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${await AsyncStorage.getItem('token')}` }}
        );

        setProfileData(newProfileData);
        setEditBasicProfileModalVisible(false); // 모달 닫기
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
            const formData = new FormData();
            formData.append('fileMedia', {
                uri: pickerResult.assets[0].uri,
                type: pickerResult.assets[0].type,
                name: pickerResult.assets[0].uri.split('/').pop(),
            });

            await axios.post("http://192.168.1.27:8080/users/updateProfileImg", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
                }
            });

            // setProfileImg(pickerResult.assets[0].uri)
            Alert.alert('성공적으로 프로필이 적용되었습니다.');
            setTimeout(() => {
                navigation.reset({index: 0, routes: [{name: "MainScreen"}]})
            }, 1000);
        }else{
            alert('cancelled!');
        }
    };

    // 추가 정보 모달 열기
    const handleAddInfo = async () => {
        if (newInfo.title && newInfo.value) {
            setAdditionalInfo([...additionalInfo, { title: newInfo.title, value: newInfo.value }]);
            console.log(newInfo);
            setAddProfileModalVisible(false); // 추가 후 모달 닫기
            setNewInfo({ title: '', value: '' }); // 입력 필드 초기화

            await axios.post("http://192.168.1.27:8080/users/updateAppeal", {appeal: JSON.stringify([...additionalInfo, { title: newInfo.title, value: newInfo.value }])},
                { headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${await AsyncStorage.getItem('token')}` }}
            );
        } else {
            Alert.alert("오류", "모든 필드를 입력해주세요.");
        }
    };

    // 모달을 닫는 함수
    const handleCloseModal = () => {
        setModalVisible(false); // 모달 닫기
        setNewInfo({ title: '', value: '' }); // 입력 필드 초기화
    };

    const handleSwitch = () => {
        setIsCircleFront(!isCircleFront); // 상태 스위치
    };

    const handleDeleteInfo = async (index) => {
        const updatedInfo = additionalInfo.filter((_, i) => i !== index);
        setAdditionalInfo(updatedInfo);

        await axios.post("http://192.168.1.27:8080/users/updateAppeal", {appeal: JSON.stringify(updatedInfo)},
            { headers: {"Content-Type": "application/json", 'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`}} 
        );
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

    // 미디어 선택 함수
    const handleSelectMedia = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            alert('미디어 접근 권한이 필요합니다!');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.All, // 사진과 비디오 모두 선택 가능
            allowsEditing: true,
            quality: 1,
        });

        if (!pickerResult.cancelled) {
            const formData = new FormData();
            formData.append('fileMedia', {
                uri: pickerResult.assets[0].uri,
                type: pickerResult.assets[0].type,
                name: pickerResult.assets[0].uri.split('/').pop(),
            });

            const responsePath = await axios.post("http://192.168.1.27:8080/users/uploadMedia", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
                }
            });

            const newMedia = {
                uri: `${responsePath.data}`,
                type: pickerResult.assets[0].type,
            };

            setMediaList([newMedia, ...mediaList]);
    
            await axios.post("http://192.168.1.27:8080/users/updateMedia", {media: JSON.stringify([newMedia, ...mediaList])},
                {headers: {"Content-Type": "application/json", "Authorization": `Bearer ${await AsyncStorage.getItem('token')}`,}}
            );
        }
    };

    // 미디어 삭제 함수
    const handleDeleteMedia = async (index) => {
        const updatedMediaList = mediaList.filter((_, i) => i !== index);
        setMediaList(updatedMediaList);

        await axios.post("http://192.168.1.27:8080/users/updateMedia", {media: JSON.stringify(updatedMediaList)},
            {headers: {"Content-Type": "application/json", "Authorization": `Bearer ${await AsyncStorage.getItem('token')}`,}}
        );
    };

    
    const selectVideo = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos, // 동영상만 선택
      });
  
      if (!result.canceled) {
        console.log('Video URI:', result.assets[0].uri);
      } else {
        console.log('User cancelled video picker');
      }
    };

    // 수정 모달 열기
    const handleEdit = (index) => {
        setEditItem({ ...additionalInfo[index] }); // 편집할 항목 설정
        setEditMode(index); // 수정할 항목 인덱스 설정
        setEditProfileModalVisible(true); // 수정 모달 열기
    };

    // 기본 정보 수정 모달 열기
    const handleBasicEdit = (key) => {
        setEditItem({ key, value: profileData[key] }); // 수정할 키와 값을 설정
        setEditBasicProfileModalVisible(true); // 모달 열기
    };

    const [selectedImageUri, setSelectedImageUri] = useState(null); // 선택된 이미지 URI

    const handleImagePress = (uri) => {
        setSelectedImageUri(uri);  // 클릭한 이미지의 URI 저장
        setModalVisible(true);  // 모달 열기
    };


    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS와 Android에 따라 키보드 회피 방식 설정
            keyboardVerticalOffset={50} // 키보드로 인해 뷰가 올라가는 정도 조정
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                keyboardShouldPersistTaps='handled' // 키보드가 올라갔을 때 스크롤 유지
            >
                {/*편집 버튼*/}
                <TouchableOpacity style={styles.editButton} onPress={() => {
                        setShowInput(!showEditButtons);
                        setShowEditButtons(!showEditButtons);
                        handleEditButtonPress();
                    }}>
                        <Icon2 style={styles.editButton} name="edit-3" size={24} color="#9AAEFF" />
                    </TouchableOpacity>
                    
                <View style={styles.header}>
                    <Text style={styles.headerText}>{profileData.username} 님의 프로필</Text>
                </View>

                <View style={styles.photoContainer}>
                    {/* 프로필 사진 */}
                    <Image
                        source={profileImg ? profileImg.includes("uploads") ? { uri: `http://192.168.1.27:8080/${profileImg}`, cache: 'reload' } : profileImg : require('../../../assets/testProfile/kimgoeunProfile.png')} // 기본 이미지 설정
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
                        source={
                            avatarImg ? avatarImg.includes("output")
                            ? { uri: `http://192.168.1.10:1000/${avatarImg}`, cache: 'reload' } // 적용된 아바타 URI 사용
                            : avatarImg : require('../../../assets/nothing.png') // 기본 이미지
                        }
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
                    <TouchableOpacity style={styles.switchButton} onPress={() => {
                        handleSwitch();
                    }}>
                        <Icon5 style={styles.switchText} name="account-convert-outline" size={24} color="#9AAEFF" />
                    </TouchableOpacity>
                </View>



                <View>
                    {isCircleFront === true && ( // overlappingCircle이 왼쪽에 있을 때만 렌더링
                        <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate("AvatarScreen", {userUID: userData.userUID})}>
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
                        {['MBTI', '나이', '지역'].map((key) => (
                            <View key={key} style={styles.infoBox}>
                                <Text style={styles.infoTextOriginal}>{key}: {profileData[key]}</Text>
                                {showEditButtons && (
                                        <TouchableOpacity 
                                            onPress={() => handleBasicEdit(key)} 
                                            style={styles.informationEditButton}
                                        >
                                            <Text style={styles.editButtonText}>수정</Text>
                                        </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* 나머지 기본 프로필 정보 */}
                    {Object.entries(profileData)
                        .filter(([key]) => !['MBTI', '나이', '지역', 'username', 'profile_picture', 'character_picture', 'appeal', 'media'].includes(key)) // 수정 가능한 키 필터링
                        .map(([key, value]) => (
                            <View style={styles.hobbyBox} key={key}>
                                <Text style={styles.infoText}>
                                    <Text style={styles.keyText}>{key}{'\n'}</Text>
                                    <Text style={styles.valueText}> {value}</Text>
                                </Text>
                                {showEditButtons && (
                                    <TouchableOpacity
                                        onPress={() => handleBasicEdit(key)} // 클릭 시 수정 모달 오픈
                                        style={styles.informationEditButton}
                                    >
                                        <Text style={styles.editButtonText}>수정</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                    ))}
                            
                    {/* 추가 정보 수정 UI */}
                    {additionalInfo.map((item, index) => (
                        <View key={index} style={styles.hobbyBox}>
                            <Text style={styles.hobbyText}>
                                <Text style={styles.keyText}>{item.title}{'\n'}</Text>
                                <Text style={styles.valueText}> {item.value}</Text>
                            </Text>
                            {showEditButtons && selectedIndex === 0 && (
                                <>
                                    <TouchableOpacity onPress={() => handleEdit(index)} style={styles.informationEditButton}>
                                        <Text style={styles.editButtonText}>수정</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteInfo(index)} style={styles.deleteButton}>
                                        <Text style={styles.deleteButtonText}>삭제</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    ))}

                    {/* 기본 정보 수정 모달 */}
                    <EditBasiccProfileModal
                        visible={editBasicProfileModalVisible}
                        onClose={() => setEditBasicProfileModalVisible(false)}
                        onSave={handleBasicSaveEdit} // 수정 저장 처리
                        editItem={editItem} // 수정할 데이터 전달
                        setEditItem={setEditItem} // 수정할 데이터 업데이트 함수 전달
                        profileData={profileData} // 상태 전달
                        setProfileData={setProfileData} // 상태 업데이트 함수 전달
                    />
                    
                    {/* 수정 모달 */}
                    <EditProfileModal
                        visible={editProfileModalVisible}
                        onClose={() => setEditProfileModalVisible(false)}
                        onSave={handleSaveEdit} // 수정 저장 처리
                        editItem={editItem}
                        setEditItem={setEditItem}
                    />

                    {/* 새 정보 추가 입력 필드 */}
                    {showEditButtons && (
                        <TouchableOpacity
                        style={styles.addProfileBtn}
                        onPress={() => {
                            setAddProfileModalVisible(true); // 추가 모달을 열기 위한 코드
                        }}
                        >
                            <Icon3 style={styles.switchText} name="add-circle-outline" size={35} color="#9AAEFF" />
                        </TouchableOpacity>
                    )}

                    {/* 추가 정보 모달 */}
                    <AddProfileModal
                        visible={addProfileModalVisible}  // 여기에 visible 상태 전달
                        onClose={() => setAddProfileModalVisible(false)}  // 모달 닫기 함수
                        onAdd={handleAddInfo}  // 새로운 정보 추가 함수
                        newInfo={newInfo}  // 새 정보 상태
                        setNewInfo={setNewInfo}  // 새 정보 업데이트 함수
                    />

                    <View style={styles.appeal}>
                        <Text style={styles.appealText}>어필하고 싶은 내용을 적어보세요!</Text>
                    </View>
                </View>
                ) : (
                    <KeyboardAvoidingView>
                        <View 
                            style={[
                                styles.mediaContainer, 
                                mediaList.length === 1 ? { alignItems: 'flex-start' } : { alignItems: 'center' }
                            ]}
                        >
                            {/* <TouchableOpacity style={styles.addMediaButton} onPress={selectVideo}>
                                <Text style={styles.addMediaText}>동영상 추가</Text>
                            </TouchableOpacity> */}
                        
                            <TouchableOpacity style={styles.addMediaButton} onPress={handleSelectMedia}>
                                <Text style={styles.addMediaText}>사진 추가</Text>
                            </TouchableOpacity>
                            <FlatList
                                data={mediaList}
                                nestedScrollEnabled={true} // 이 옵션을 추가하면 오류 해결 가능
                                keyExtractor={(item, index) => index.toString()}
                                numColumns={numColumns}  // numColumns 상태에 따라 렌더링
                                key={numColumns}  // numColumns가 변경될 때마다 새로 렌더링
                                renderItem={({ item, index }) => (
                                        <View style={styles.mediaItem}>
                                            {item.type === 'image' ? (
                                                <TouchableOpacity onPress={() => handleImagePress(item.uri)}>
                                                    <Image 
                                                        source={{ uri: `http://192.168.1.27:8080/${item.uri}` }} 
                                                        style={styles.mediaPreview} 
                                                    />
                                                </TouchableOpacity>
                                            ) : (
                                                <Video
                                                    source={{ uri: `http://192.168.1.27:8080/${item.uri}` }}
                                                    style={styles.mediaPreview}
                                                    resizeMode="cover"
                                                    shouldPlay={false}
                                                />
                                            )}
                                            {showEditButtons === true && (
                                            <TouchableOpacity
                                                style={styles.deleteMediaButton}
                                                onPress={() => handleDeleteMedia(index)}
                                            >
                                                <Text style={styles.deleteMediaText}>삭제</Text>
                                            </TouchableOpacity>
                                            )}
                                        </View>
                                )}
                            />

                            {/* 이미지 모달 */}
                            {selectedImageUri && (
                                <Modal
                                visible={modalVisible}
                                transparent={true}
                                animationType="fade"
                                onRequestClose={() => setModalVisible(false)} // 모달 닫기
                                >
                                <View style={styles.modalOverlay}>
                                    <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => setModalVisible(false)} // 모달 닫기
                                    >
                                    <Text style={styles.modalCloseText}>닫기</Text>
                                    </TouchableOpacity>
                                    <Image
                                    source={{ uri: `http://192.168.1.27:8080/${selectedImageUri}` }}
                                    style={styles.modalImage}
                                    />
                                </View>
                                </Modal>
                            )}
                            </View>
                            <View style={styles.appeal}>
                                <Text style={styles.appealText}>공유하고 싶은 사진을 올려보세요!</Text>
                            </View>
                    </KeyboardAvoidingView>
                )}
            </ScrollView>

            
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
        marginTop: -50,
        alignItems: 'center',
        flexDirection: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        fontSize: 20,//Platform.OS === 'android' ? 17 : 24,
        fontWeight: 'bold',
        marginTop: 50,
        color: '#9AAEFF',
    },
    editButton: {
        color: '#9AAEFF',
        fontSize: 24,
        textAlign: 'center',
        marginTop: 15,
        marginLeft: 150
    },
    // editButtonText: {
    //     marginTop: 50,
    //     fontSize: 24,
    // },
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
        paddingVertical: 15,       // 상하 여백을 추가
        backgroundColor: '#b0c0ff',
        borderRadius: 10,
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
        marginHorizontal: 3,
    },
    infoTextOriginal: {
        fontSize: 18,            // 더 큰 폰트 크기
        lineHeight: 22, // 텍스트 간 여백 추가
        color: '#333',           // 텍스트 색상 변경 (조금 더 어두운 색상)
        textAlign: 'left',       // 왼쪽 정렬
        //marginBottom: 10,        // 항목 간 간격 추가
    },
    infoText: {
        fontSize: 18,            // 더 큰 폰트 크기
        lineHeight: 22, // 텍스트 간 여백 추가
        color: '#333',           // 텍스트 색상 변경 (조금 더 어두운 색상)
        textAlign: 'left',       // 왼쪽 정렬
        marginBottom: 10,        // 항목 간 간격 추가
    },
    keyText: {
        fontWeight: 'bold',
        color: '#333',
    },
    valueText: {
        color: '#555',
    },
    hobbyBox: {
        marginVertical: 10,      // 각 항목 간 세로 간격
        paddingHorizontal: 15,   // 좌우 여백 추가
        borderBottomWidth: 1,    // 구분선 추가
        borderColor: '#9fa9cc',     // 구분선 색상
        paddingBottom: 10,       // 구분선과 내용 사이 여백
    },
    editButtonText: {
        color: '#FFFFFF', // 텍스트 흰색
        fontSize: 14, // 텍스트 크기
        fontWeight: '600', // 텍스트 굵기
        letterSpacing: 0.5, // 텍스트 간격
    },
    hobbyText: {
        fontSize: 18,
        color: '#444',
        textAlign: 'left',
        marginBottom: 10,        // 항목 간 간격 추가
        lineHeight: 22, // 텍스트 간 여백 추가
    },
    basicHobbyBox: {
        width: 100
    },
    inputContainer: {
        //flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    input: {
        width: '90%',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 5,
        padding: 10,
        flex: 1,
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
        borderRadius: 8,
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
        marginTop: 5
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
    mediaContainer: {
        marginTop: 20,
        paddingHorizontal: 5,
        alignItems: 'center', // 가운데 정렬
    },
    addMediaButton: {
        backgroundColor: '#9AAEFF',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    addMediaText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    mediaItem: {
        marginBottom: 15,
        left: 3,
    },
    mediaPreview: {
        width: 150,
        height: 150,
        borderRadius: 10,
        marginRight: 10,  // 여러 이미지를 나란히 놓을 때 간격을 줄 수 있음
        alignItems: 'center',
    },
    deleteMediaButton: {
        backgroundColor: '#FF6F61',
        borderRadius: 5,
        padding: 5,
        alignItems: 'center',
        marginTop: 5,
        width: 150
    },
    deleteMediaText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    addProfileBtn: {
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    informationEditButton: {
        backgroundColor: '#9AAEFF', // 녹색 배경
        borderRadius: 8, // 모서리 둥글게
        padding: 6,
        alignItems: 'center', // 텍스트 중앙 정렬
        justifyContent: 'center', // 내용 중앙 정렬
        // shadowColor: '#000', // 그림자 색상
        // shadowOffset: { width: 0, height: 2 }, // 그림자 오프셋
        // shadowOpacity: 0.2, // 그림자 투명도
        // shadowRadius: 4, // 그림자 반경
        // elevation: 5, // 안드로이드 그림자
        marginTop: 8, // 상단 여백
    },  
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // 반투명 배경
      },
      modalImage: {
        width: '90%',
        height: '80%',
        resizeMode: 'contain',
      },
      modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 20,
      },
      modalCloseText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
      },
});

export default ProfileScreen;
