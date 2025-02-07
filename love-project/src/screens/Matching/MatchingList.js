import React, {useEffect, useState} from 'react';
import { Image, FlatList, View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const MatchingList = () => {
    const navigation = useNavigation(); // 화면 전환에 사용
    const route = useRoute(); // 전달받은 추천 리스트
    const { recommend } = route.params; // 추천 리스트 데이터 추출
    const [recommendUserData, setRecommendUserData] = useState([]);

    useEffect(() => {
        const loadRecommendUserData = async () => {
            if (recommend.length === 0) return;

            try {
                const responses = await Promise.all(
                    recommend.map(async (data) => {
                        const formData = new FormData();
                        formData.append("userUID", data.userUID);
    
                        const response = await axios.post("http://192.168.1.27:8080/users/findUserData", formData, { 
                            headers: { "Content-Type": "multipart/form-data" }
                        });
    
                        return response.data;
                    })
                );

                // console.log(responses);
                setRecommendUserData(responses);
            } catch(error) {
                console.error("추천 사용자 데이터 로드 중 오류 발생:", error);
            }
        };
    
        loadRecommendUserData();
    }, [recommend]);

    const handlePress = (item) => {
        Alert.alert(
            "선택하세요",
            "이동할 화면을 선택해주세요.",
            [
                {
                    text: "프로필",
                    onPress: () => navigation.navigate('OpProfileScreen', { userData: item })
                },
                {
                    text: "채팅",
                    onPress: () => navigation.navigate('MatchingChatScreen', { partner: item })
                },
                { text: "취소", style: "cancel" }
            ]
        );
    };

    return (
        <FlatList
            data={recommendUserData}
            keyExtractor={(item) => item.userUID ? item.userUID.toString() : Math.random().toString()} // uid가 없으면 임의의 숫자를 사용
            ListHeaderComponent={
                // <View style={styles.headerMsg}>
                //     <Text style={styles.headerText}>
                //         대화하고 싶은 상대를 선택하세요!
                //     </Text>
                // </View>
                <View style={styles.header}>
                    <Text style={styles.top}>
                        
                        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MatchingChatScreen")}>
                        <Text style={styles.topText}>매칭 리스트-여길 누르면 1:1 채팅창으로 이동해요</Text>
                        </TouchableOpacity>
                        
                    </Text>
                </View>
            }
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => {handlePress(item.user)}}
                >
                    <View style={styles.profile}>
                        <Image
                            source={
                                item.user.profilePicture ? { uri: `http://192.168.1.27:8080/${item.user.profilePicture}`} : require('../../../assets/default-profile.png')
                            }
                            style={styles.profileImg}
                            defaultSource={require('../../../assets/default-profile.png')}
                        />
                        <Text style={styles.name}>{item.user.username}</Text>
                    </View>

                    <View style={styles.box}>
                        <Text style={styles.boxText}>
                            {item.user.introduce}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            horizontal={false} // 수평 배열 비활성화
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerMsg: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 15,
        marginBottom: 15,
    },
    headerText: {
        alignItems: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        textAlign:'center',
        fontSize: 20,
        color: '#FF9AAB',
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: '#B2E0F9',
        padding: 10,
        marginBottom: 30,
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        textAlign:'center',
    },
    topText: {
        color: 'black',
        fontSize: 16,        
        flex: 1,
    },
    box: {
        width: '68%',
        height: 100,
        textAlign: 'center',
        justifyContent: 'center',
    },
    boxText: {
        fontSize: 17,
    },
  
    separator: {
        marginTop: 5,
        marginBottom: 5,
        height: 1,
        backgroundColor: '#ccc',
    },

    profile: {
        flexDirection: 'column',
        alignItems: 'center',
        marginLeft: 30,
        marginRight: 30,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2e1e4',
        borderRadius: 10,
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
        marginHorizontal: 10,
    },
    profileImg: {
        width: 60,
        height: 60,
        borderRadius: 40,
        marginBottom: 12,
    },
  
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
});

export default MatchingList;