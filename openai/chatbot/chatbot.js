import { REACT_APP_OPENAI_API_KEY } from '@env';

const API_URL = 'https://api.openai.com/v1';

/**
 * OpenAI API 호출을 위한 공통 함수
 */
export const fetchFromAPI = async (endpoint, method, body) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${REACT_APP_OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2',
            },
            body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API 호출 실패');
        }

        return await response.json();
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
};

/**
 * 스레드 생성
 * @param {string} userId - 사용자 ID
 * @param {string} assistant - 어시스턴트 ID
 * @returns {string} 생성된 스레드 ID
 */
export const createThread = async (userId, assistant) => {
    const response = await fetchFromAPI('/threads', 'POST', {
        user: userId,
        assistant, // 어시스턴트 ID
    });
    return response.id;
};

/**
 * 메시지 전송
 * @param {string} threadId - 대화 스레드 ID
 * @param {string} content - 사용자 입력 메시지
 */
export const sendMessage = async (threadId, content) => {
    await fetchFromAPI(`/threads/${threadId}/messages`, 'POST', {
        role: 'user',
        content,
    });
};

/**
 * 어시스턴트 활성화
 * @param {string} threadId - 대화 스레드 ID
 */
export const activateAssistant = async (threadId) => {
    const response = await fetchFromAPI(`/threads/${threadId}/activate`, 'POST');
    return response.id;
};

/**
 * 메시지 목록 가져오기
 * @param {string} threadId - 대화 스레드 ID
 */
export const getMessages = async (threadId) => {
    const response = await fetchFromAPI(`/threads/${threadId}/messages`, 'GET');
    return response.data.map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));
};
