import logging
from openai import OpenAI
from dotenv import load_dotenv
import os
import time

# .env 파일 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# OpenAI 클라이언트 초기화
api_key = os.getenv("REACT_APP_OPENAI_API_KEY")  # .env 파일에 API 키 저장
if not api_key:
    raise Exception("REACT_APP_OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
client = OpenAI(api_key=api_key)  # OpenAI 클라이언트 초기화

def send_message(thread_id, content):
    client.beta.threads.messages.create(thread_id=thread_id, role="user", content=content)

def activate_message(thread_id, partner_id):
    return client.beta.threads.runs.create(thread_id=thread_id, assistant_id=partner_id).id

def wait_for_completion(thread_id, run_id):
    while True:
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
        if run.status == "completed":
            break
        time.sleep(0.1)

def create_new_thread():
    """
    OpenAI API를 사용하여 새 스레드를 생성하고 thread_id를 반환합니다.
    """
    thread = client.beta.threads.create()
    return thread.id


def list_messages(thread_id):
    return client.beta.threads.messages.list(thread_id).data[0].content[0].text.value
