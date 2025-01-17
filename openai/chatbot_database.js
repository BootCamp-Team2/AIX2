import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자 ID 생성
export const createUser = async () => {
    const newId = Math.random().toString(36).substr(2, 6).toUpperCase();
    try {
        const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
        users.push({ id: newId, thread_key: null });
        await AsyncStorage.setItem('users', JSON.stringify(users));
        console.log(`User created with ID: ${newId}`);
        return newId;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// 사용자 ID 검증
export const validateUser = async (userId) => {
    try {
        const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
        return users.some((user) => user.id === userId);
    } catch (error) {
        console.error('Error validating user:', error);
        throw error;
    }
};

// 스레드 생성
export const createThread = async (userId) => {
    const newThreadKey = `thread-${Math.random().toString(36).substr(2, 10)}`;
    try {
        const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
        const updatedUsers = users.map((user) =>
            user.id === userId ? { ...user, thread_key: newThreadKey } : user
        );
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log(`Thread created for User ID: ${userId}, Thread Key: ${newThreadKey}`);
        return newThreadKey;
    } catch (error) {
        console.error('Error creating thread:', error);
        throw error;
    }
};

/**
 * 사용자 ID로 스레드 키 조회
 * @param {string} userId - 사용자 ID
 * @returns {string|null} 사용자에 연결된 스레드 키 (없으면 null)
 */
export const getThread = async (userId) => {
    try {
        const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
        const user = users.find((user) => user.id === userId);
        if (user && user.thread_key) {
            return user.thread_key;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching thread:', error);
        throw error;
    }
};

/**
 * 사용자 ID로 스레드 키 삭제
 * @param {string} userId - 사용자 ID
 */
export const deleteThread = async (userId) => {
    try {
        const users = JSON.parse(await AsyncStorage.getItem('users')) || [];
        const updatedUsers = users.map((user) =>
            user.id === userId ? { ...user, thread_key: null } : user
        );
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log(`Thread deleted for User ID: ${userId}`);
    } catch (error) {
        console.error('Error deleting thread:', error);
        throw error;
    }
};