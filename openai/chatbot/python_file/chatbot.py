import logging
import os
import time
from openai import OpenAI
from dotenv import load_dotenv

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
