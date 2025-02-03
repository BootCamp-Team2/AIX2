import React from 'react';
import { Image, FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const MatchingList = () => {
    const navigation = useNavigation(); // 화면 전환에 사용
    const route = useRoute(); // 전달받은 추천 리스트
    const { recommend } = route.params; // 추천 리스트 데이터 추출

    return (
        <FlatList
            data={recommend}
            keyExtractor={(item) => item.uid ? item.uid.toString() : Math.random().toString()} // uid가 없으면 임의의 숫자를 사용
            ListHeaderComponent={
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
                    onPress={() => {
                        // 프로필 클릭 시 채팅 화면으로 이동
                        navigation.navigate('ChatchatScreen', { partner: item });
                    }}
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
                        <Text style={styles.name}>{item.name ?? 'ㅇㅇㅇ'}</Text>
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