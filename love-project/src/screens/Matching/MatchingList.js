import React from 'react';
import { Image, FlatList, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const MatchingList = () => {
    const navigation = useNavigation(); // 화면 전환에 사용
    const route = useRoute(); // 전달받은 추천 리스트
    const { recommend } = route.params; // 추천 리스트 데이터 추출

    const handlePress = (item) => {
        Alert.alert(
            "선택하세요",
            "이동할 화면을 선택해주세요.",
            [
                {
                    text: "프로필",
                    onPress: () => navigation.navigate('OpProfileScreen', { userUID: item.userUID })
                },
                {
                    text: "채팅",
                    onPress: () => navigation.navigate('ChatchatScreen', { partner: item })
                },
                { text: "취소", style: "cancel" }
            ]
        );
    };

    return (
        <FlatList
            data={recommend}
            keyExtractor={(item) => item.uid ? item.uid.toString() : Math.random().toString()} // uid가 없으면 임의의 숫자를 사용
            ListHeaderComponent={
                <View style={styles.header}>
                    <Text style={styles.top}>
                        <Icon name="menu" size={40} color="black" />
                        <Text style={styles.topText}>소개팅 리스트</Text>
                        <Icon name="check" size={40} color="black" />
                    </Text>
                </View>
            }
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => {handlePress(item)}}
                >
                    <View style={styles.profile}>
                        <Image
                            source={
                                item.myGender === '남성'
                                    ? require('../../../assets/default-profile-male.png')
                                    : require('../../../assets/default-profile-female.png')
                            }
                            style={styles.profileImg}
                            defaultSource={require('../../../assets/default-profile.png')}
                        />
                        <Text style={styles.name}>{item.username ?? 'ㅇㅇㅇ'}</Text>
                    </View>

                    <View style={styles.box}>
                        <Text style={styles.boxText}>
                            자연스러운 만남을 추구합니다~ 서로 얘기 나누며 친해져 가요~~
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
    header: {
        backgroundColor: '#B2E0F9',
        padding: 10,
        marginBottom: 30,
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topText: {
        color: 'black',
        fontSize: 24,
        textAlign: 'center',
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
        backgroundColor: '#B2E0F9',
        borderRadius: 10,
        padding: 10,
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