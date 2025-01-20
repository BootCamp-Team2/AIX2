from chatbot import client, send_message, activate_message, wait_for_completion, list_messages
from analyzing_emotion import analyze_emotion
import os

def process_dating_coaching_with_chat_history(chat_history, emotion_model):
    """
    연애 코칭을 수행하는 함수.
    사용자의 채팅 기록을 어시스턴트에게 보내고 응답을 처리합니다.
    """
    if not chat_history:
        raise ValueError("채팅 기록이 없습니다.")

    try:
        # 대화 내용을 요약하여 코칭 요청
        coaching_prompt = "다음 대화를 기반으로 연애 코칭을 제공해주세요:\n" + "\n".join(chat_history)

        assistant_id = os.getenv("REACT_APP_DATING_ASSISTANT_ID")
        if not assistant_id:
            raise Exception("REACT_APP_DATING_ASSISTANT_ID가 설정되지 않았습니다.")

        # 새 스레드 생성
        thread = client.beta.threads.create()
        thread_key = thread.id

        send_message(thread_key, coaching_prompt)
        run_id = activate_message(thread_key, assistant_id)
        wait_for_completion(thread_key, run_id)
        coaching_response = list_messages(thread_key)

        # 감정 분석 수행
        emotion_results = [analyze_emotion(msg, emotion_model) for msg in chat_history]

        return coaching_response, emotion_results

    except Exception as e:
        raise RuntimeError(f"연애 코칭 처리 중 오류 발생: {e}")
