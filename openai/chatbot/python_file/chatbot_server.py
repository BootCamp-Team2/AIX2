from flask import Flask, request, jsonify
import logging
from analyzing_emotion import initialize_emotion_model, analyze_emotion
from openai import OpenAI
import time
from dotenv import load_dotenv
import os
import sqlite3
from flask_cors import CORS  # CORS 관련 라이브러리 추가

# .env 파일 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# OpenAI 클라이언트 초기화
api_key = os.getenv("REACT_APP_OPENAI_API_KEY")
if not api_key:
    raise Exception("REACT_APP_OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
client = OpenAI(api_key=api_key)

# 감정 분석 모델 초기화
emotion_model = initialize_emotion_model()

# Partner ID 읽기
def get_partner_id(partner_id="HANA"):
    if partner_id.upper() == "HWARANG":
        partner_id_env = os.getenv("REACT_APP_PARTNER_ID_HWARANG")
    else:
        partner_id_env = os.getenv("REACT_APP_PARTNER_ID_HANA")

    if not partner_id_env:
        raise Exception(f"REACT_APP_PARTNER_ID_{partner_id.upper()}가 .env 파일에 설정되지 않았습니다.")
    return partner_id_env

# 데이터베이스 초기화 함수
def initialize_database():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS threads (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id TEXT,
                        thread_key TEXT
                    )''')
    conn.commit()
    conn.close()

# 스레드 키 저장 및 불러오기
def get_or_create_thread_key(user_id):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # 사용자에 대한 기존 스레드 키 확인
    cursor.execute("SELECT thread_key FROM threads WHERE user_id = ?", (user_id,))
    result = cursor.fetchone()

    if result:
        thread_key = result[0]
    else:
        # 스레드 생성 및 저장
        thread = client.beta.threads.create()
        thread_key = thread.id
        cursor.execute("INSERT INTO threads (user_id, thread_key) VALUES (?, ?)", (user_id, thread_key))
        conn.commit()

    conn.close()
    return thread_key

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
    return messages.data[0].content[0].text.value

# 감정 분석 및 응답 데이터 생성
def analyze_and_respond(user_id, user_input, partner_id):
    thread_id = get_or_create_thread_key(user_id)
    send_message(thread_id, user_input)
    run_id = activate_message(thread_id, partner_id)
    wait_for_completion(thread_id, run_id)
    partner_response = list_messages(thread_id)
    emotion = analyze_emotion(partner_response, emotion_model)  # 감정 분석
    
    # 감정 분석 결과가 None이나 빈 문자열이면 기본 값 반환
    if not emotion:
        emotion = "No emotion detected"
        
    return partner_response, emotion

# Flask 서버 정의
app = Flask(__name__)

# CORS 설정
CORS(app)  # 모든 도메인에서 오는 요청을 허용

# 데이터베이스 초기화
initialize_database()

# 기본 라우트 - chatbot.html 렌더링
@app.route('/')
def index():
    return "Chatbot is running."

# 챗봇과 대화하는 라우트
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")  # 요청 데이터를 로그로 기록

        user_input = data.get('content', '')
        user_id = data.get('user_id', '12345')  # user_id를 기본값으로 설정
        partner_choice = data.get('partner_id', 'HANA')

        if not user_id:
            return jsonify({'error': 'Invalid input received: user_id is missing'}), 400

        partner_id = get_partner_id(partner_choice)

        # AI 응답 및 감정 분석
        response, emotion = analyze_and_respond(user_id, user_input, partner_id)

        return jsonify({'response': response, 'emotion': emotion, 'thread_key': user_id})

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({'error': 'Error communicating with the chatbot server'}), 500

# Flask 서버 실행
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000,debug=True)
