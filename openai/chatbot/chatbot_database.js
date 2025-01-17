import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 사용자 데이터 관리 - 사용자 생성
 */
export const createUser = async () => {
    const newId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
    users.push({ id: newId });
    await AsyncStorage.setItem('users', JSON.stringify(users));
    return newId;
};

/**
 * 사용자 데이터 관리 - 사용자 유효성 검사
 */
export const validateUser = async (userId) => {
    const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
    return users.some((user) => user.id === userId);
};
