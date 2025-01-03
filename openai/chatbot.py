import logging
from analyzing_emotion import initialize_emotion_model, analyze_emotion
from openai import OpenAI
import time
from dotenv import load_dotenv
import os

# .env 파일 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# OpenAI 클라이언트 초기화
api_key = os.getenv("REACT_APP_OPENAI_API_KEY")
if not api_key:
    raise Exception("REACT_APP_OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
client = OpenAI(api_key=api_key)

# Partner ID 읽기
def get_partner_id():
    partner_id = os.getenv("REACT_APP_PARTNER_ID")
    if not partner_id:
        raise Exception("REACT_APP_PARTNER_ID가 .env 파일에 설정되지 않았습니다.")
    return partner_id

# 대화 스레드 생성 및 요약 파일 읽기
def get_or_create_thread_and_summary():
    try:
        with open("thread_id.txt", "r") as thread_file:
            thread_id = thread_file.read().strip()
    except FileNotFoundError:
        thread = client.beta.threads.create()
        thread_id = thread.id
        with open("thread_id.txt", "w") as thread_file:
            thread_file.write(thread_id)

    try:
        with open("chat_summation.txt", "r") as summary_file:
            summary_content = summary_file.read().strip()
            if summary_content:
                send_message(thread_id, f"지난 대화 요약: {summary_content}")
    except FileNotFoundError:
        logging.info("chat_summation.txt 파일이 없습니다. 새 대화를 시작합니다.")

    return thread_id

# 메시지 전송 함수
def send_message(thread_id, content):
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=content,
    )

# 애인 Assistant 응답 활성화
def activate_message(thread_id, partner_id):
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=partner_id,
    )
    return run.id

# 응답 완료 대기
def wait_for_completion(thread_id, run_id):
    while True:
        run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run_id
        )
        if run.status == "completed":
            break
        else:
            time.sleep(0.1)

# 메시지 수신 함수
def list_messages(thread_id):
    messages = client.beta.threads.messages.list(thread_id)
    response = messages.data[0].content[0].text.value
    return response


# 대화 요약 요청 함수
def request_chat_summary(thread_id, partner_id):
    try:
        with open("chat_summation.txt", "w") as file:
            summary_prompt = "지금까지 대화를 요약해줘"
            send_message(thread_id, summary_prompt)
            run_id = activate_message(thread_id, partner_id)
            wait_for_completion(thread_id, run_id)
            summary_response = list_messages(thread_id)
            file.write(summary_response)
        logging.info("대화 요약이 chat_summation.txt에 저장되었습니다.")
    except Exception as e:
        logging.error("대화 요약 중 오류 발생: %s", e)

# 기존 main 함수에 있던것 따로 함수로 분리함
def start_chat():
    try:
        partner_id = get_partner_id()
        thread_id = get_or_create_thread_and_summary()

        # 감정 분석 모델 초기화
        emotion_model = initialize_emotion_model()

        logging.info("\n==== Welcome to your Romantic Chat! ====")
        logging.info("You can talk to your partner as if they are right here. Type 'exit' or say goodbye to end the conversation.\n")

        while True:
            user_input = input("You: ")
            if user_input.lower() == "exit":
                logging.info("안녕! 다음에 또 얘기하자. 😊")
                request_chat_summary(thread_id, partner_id)  # 변수 전달
                break

            try:
                send_message(thread_id, user_input)
                run_id = activate_message(thread_id, partner_id)
                wait_for_completion(thread_id, run_id)
                partner_response = list_messages(thread_id)
                logging.info(f"파트너: {partner_response}\n")

                # 감정 분석 실행
                analyze_emotion(partner_response, emotion_model)

            except Exception as e:
                logging.error("대화 중 오류 발생: %s", e)
                break

    except Exception as e:
        logging.error("파트너 ID 가져오기 실패: %s", e)

if __name__ == "__main__":
    start_chat()