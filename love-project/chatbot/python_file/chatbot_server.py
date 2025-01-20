from flask import Flask, request, jsonify, session
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
    """
    사용자의 thread_key를 가져오거나 새로 생성
    """
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # 사용자에 대한 기존 스레드 키 확인
    cursor.execute("SELECT thread_key FROM users WHERE id = ?", (user_id,))
    result = cursor.fetchone()

    if result and result[0]:
        thread_key = result[0]
        logging.info(f"Existing thread key found: {thread_key} for user_id: {user_id}")
    else:
        # 새 스레드 생성 및 저장
        thread = client.beta.threads.create()
        thread_key = thread.id
        cursor.execute("""
            UPDATE users
            SET thread_key = ?
            WHERE id = ?
        """, (thread_key, user_id))
        conn.commit()
        logging.info(f"New thread key created: {thread_key} for user_id: {user_id}")

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

# 세션 암호화를 위한 Secret Key 설정
app.secret_key = "1234"  # 고유하고 안전한 키 입력

# CORS 설정
CORS(app, supports_credentials=True)  # 세션 쿠키 허용

# 데이터베이스 초기화
initialize_database()

# 기본 라우트 - chatbot.html 렌더링
@app.route('/')
def index():
    return "Chatbot is running."

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('id')
    password = data.get('password')

    if not user_id or not password:
        return jsonify({'error': 'ID와 비밀번호를 입력해주세요.'}), 400

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, nickname, password FROM users WHERE id = ?", (user_id,))
    result = cursor.fetchone()
    conn.close()

    if result:
        if result[2] == password:  # 비밀번호 확인
            session['user_id'] = result[0]  # 세션에 user_id 저장
            return jsonify({'id': result[0], 'nickname': result[1]})
        else:
            return jsonify({'error': '비밀번호가 일치하지 않습니다.'}), 401
    else:
        return jsonify({'error': '존재하지 않는 ID입니다.'}), 404

# 챗봇과 대화하는 라우트
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")

        user_input = data.get('content', '')
        user_id = session.get('user_id')  # 세션에서 user_id 가져오기
        partner_choice = data.get('partner_id', 'HANA')

        if not user_id:
            logging.error("No user_id in session")
            return jsonify({'error': '사용자가 로그인되지 않았습니다.'}), 401

        if not user_input:
            return jsonify({'error': '메시지가 비어 있습니다.'}), 400

        partner_id = get_partner_id(partner_choice)
        response, emotion = analyze_and_respond(user_id, user_input, partner_id)

        return jsonify({
            'response': response,
            'emotion': emotion,
            'thread_key': user_id
        })

    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({'error': '챗봇 서버와 통신 중 문제가 발생했습니다.'}), 500
    
@app.route('/check-thread', methods=['POST'])
def check_thread_key():
    # 로그인한 사용자 ID 가져오기
    user_id = session.get('user_id')  # 세션에서 ID 가져옴
    if not user_id:
        return jsonify({'error': '사용자가 로그인되지 않았습니다.'}), 401

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT thread_key FROM users WHERE id = ?", (user_id,))
    result = cursor.fetchone()
    conn.close()

    return jsonify({'thread_key': result[0] if result else None})

@app.route('/get-thread', methods=['POST'])
def get_thread_key():
    # 로그인한 사용자 ID 가져오기
    user_id = session.get('user_id')  # 세션에서 ID 가져옴
    if not user_id:
        return jsonify({'error': '사용자가 로그인되지 않았습니다.'}), 401

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT thread_key, assistant_key FROM users WHERE id = ?", (user_id,))
    result = cursor.fetchone()
    conn.close()

    if result:
        return jsonify({'thread_key': result[0], 'assistant_key': result[1]})
    else:
        return jsonify({'error': '스레드 키를 찾을 수 없습니다.'}), 404

@app.route('/get-user-id', methods=['GET'])
def get_user_id():
    user_id = session.get('user_id')  # 세션에서 user_id 가져오기
    if not user_id:
        logging.error("No user_id found in session.")
        return jsonify({'error': '사용자가 로그인되지 않았습니다.'}), 401

    logging.info(f"Fetched user_id from session: {user_id}")
    return jsonify({'id': user_id})

@app.route('/start-conversation', methods=['POST'])
def start_conversation():
    try:
        data = request.get_json()
        user_id = session.get('user_id')  # 세션에서 user_id 가져오기
        partner_id = data.get('partner_id')

        if not user_id:
            logging.error("사용자가 로그인되지 않았습니다.")
            return jsonify({'error': '사용자가 로그인되지 않았습니다.'}), 401

        if not partner_id:
            logging.error("어시스턴트 ID가 누락되었습니다.")
            return jsonify({'error': '어시스턴트 ID가 누락되었습니다.'}), 400

        # 스레드 생성
        thread_key = get_or_create_thread_key(user_id)

        # 어시스턴트 ID를 DB에 업데이트
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users
            SET assistant_key = ?
            WHERE id = ?
        """, (partner_id, user_id))
        conn.commit()
        conn.close()

        return jsonify({'thread_key': thread_key, 'assistant_key': partner_id})

    except Exception as e:
        logging.error(f"Error starting conversation: {e}")
        return jsonify({'error': '대화를 시작하는 동안 문제가 발생했습니다.'}), 500

# Flask 서버 실행
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000,debug=True)
