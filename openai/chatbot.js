import { REACT_APP_OPENAI_API_KEY } from '@env';

const API_URL = 'https://api.openai.com/v1';

/**
 * OpenAI API 호출을 위한 기본 설정
 */
const fetchFromAPI = async (endpoint, method, body) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${REACT_APP_OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2', // 추가된 헤더
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
 * @param {string} assistantId - 어시스턴트 ID
 */
export const activateAssistant = async (threadId, assistantId) => {
    const run = await fetchFromAPI(`/threads/${threadId}/runs`, 'POST', {
        assistant_id: assistantId,
    });
    return run.id;
};

/**
 * 응답 대기
 * @param {string} threadId - 대화 스레드 ID
 * @param {string} runId - 활성화된 어시스턴트 실행 ID
 */
export const waitForCompletion = async (threadId, runId) => {
    while (true) {
        const run = await fetchFromAPI(`/threads/${threadId}/runs/${runId}`, 'GET');
        if (run.status === 'completed') {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기
    }
};

/**
 * 메시지 목록 가져오기
 * @param {string} threadId - 대화 스레드 ID
 */
export const getMessages = async (threadId) => {
    const messages = await fetchFromAPI(`/threads/${threadId}/messages`, 'GET');
    return messages.data.map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));
};
