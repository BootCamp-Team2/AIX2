import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, FlatList, Modal } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons'; // Expo Icons 추가
import Icon2 from 'react-native-vector-icons/Feather';
import Icon3 from 'react-native-vector-icons/Ionicons'; 
import Icon4 from 'react-native-vector-icons/FontAwesome5';
import Icon5 from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import Video from 'react-native-video';

const OpProfileScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [selectedIndex, setSelectedIndex] = useState(0); // 선택된 인덱스 상태
    const [profileData, setProfileData] = useState({});
    const [isCircleFront, setIsCircleFront] = useState(false);
    const [additionalInfo, setAdditionalInfo] = useState([]);
    const [mediaList, setMediaList] = useState([]); // 업로드된 미디어 리스트 상태
    const [profileImg, setProfileImg] = useState(null);
    const [avatarImg, setAvatarImg] = useState(null);
    const [numColumns, setNumColumns] = useState(2); // numColumns 상태 관리

    const { userData } = route.params;
    // console.log(userData);

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
            setAvatarImg(userData.characterPicture ?? null);

            setMediaList(userData.media ? JSON.parse(userData.media) : []);
            setAdditionalInfo(userData.appeal ? JSON.parse(userData.appeal) : []);
        };

        loadProfileData();
    }, [userData]);

    const handleSwitch = () => {
        setIsCircleFront(!isCircleFront); // 상태 스위치
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
                <View style={styles.header}>
                    <Text style={styles.headerText}>{profileData.username} 님의 프로필</Text>
                </View>

                <View style={styles.photoContainer}>
                    {/* 프로필 사진 */}
                    <Image
                        source={profileImg ? { uri: `http://192.168.1.29:8080/${profileImg}` } : require('../../../assets/testProfile/kimgoeunProfile.png')} // 기본 이미지 설정
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
                    {avatarImg && ( // 아바타 이미지 있을때에만 나오게 지정
                        <Image
                            source={{ uri: `http://192.168.1.10:1000/${avatarImg}` }} // avatarImg가 있을 때 URI 사용
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
                    )}
                    {/* 프로필 변경 버튼 */}
                    <TouchableOpacity style={styles.switchButton} onPress={() => {
                        handleSwitch();
                    }}>
                        <Icon5 style={styles.switchText} name="account-convert-outline" size={24} color="#9AAEFF" />
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
                                <Text style={styles.infoText}>{key}: {profileData[key]}</Text>
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
                            </View>
                    ))}
                            
                    {/* 추가 정보 수정 UI */}
                    {additionalInfo.map((item, index) => (
                        <View key={index} style={styles.hobbyBox}>
                            <Text style={styles.hobbyText}>
                                <Text style={styles.keyText}>{item.title}{'\n'}</Text>
                                <Text style={styles.valueText}> {item.value}</Text>
                            </Text>
                        </View>
                    ))}
                </View>
                ) : (
                    <KeyboardAvoidingView>
                        <View 
                            style={[
                                styles.mediaContainer, 
                                mediaList.length === 1 ? { alignItems: 'flex-start' } : { alignItems: 'center' }
                            ]}
                        >
                            <FlatList
                                data={mediaList}
                                keyExtractor={(item, index) => index.toString()}
                                numColumns={numColumns}  // numColumns 상태에 따라 렌더링
                                key={numColumns}  // numColumns가 변경될 때마다 새로 렌더링
                                renderItem={({ item, index }) => (
                                        <View style={styles.mediaItem}>
                                            {item.type === 'image' ? (
                                                <Image 
                                                    source={{ uri: `http://192.168.1.29:8080/${item.uri}` }} 
                                                    style={styles.mediaPreview} 
                                                />
                                            ) : (
                                                <Video
                                                    source={{ uri: `http://192.168.1.29:8080/${item.uri}` }}
                                                    style={styles.mediaPreview}
                                                    resizeMode="cover"
                                                    shouldPlay={false}
                                                />
                                            )}
                                        </View>
                                )}
                            />
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
        // marginTop: -37,
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
        backgroundColor: '#FFFFFF',
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
        borderColor: '#ccc',     // 구분선 색상
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
    
});

export default OpProfileScreen;
