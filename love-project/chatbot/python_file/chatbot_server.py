from flask import Flask, request, jsonify
import logging
from openai import OpenAI
import time
from dotenv import load_dotenv
import os
import mysql.connector
from flask_cors import CORS
from analyzing_emotion import initialize_emotion_model, analyze_emotion
from dating_coaching_handler import process_dating_coaching_with_chat_history

# .env 파일 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# OpenAI 클라이언트 초기화
api_key = os.getenv("REACT_APP_OPENAI_API_KEY")
if not api_key:
    raise Exception("REACT_APP_OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
client = OpenAI(api_key=api_key)

# MySQL 연결 설정
db = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    port=os.getenv("MYSQL_PORT"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE")
)
cursor = db.cursor()

# 감정 분석 모델 초기화
emotion_model = initialize_emotion_model()

# 데이터베이스 초기화 함수
def initialize_database():
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            useruid VARCHAR(255) PRIMARY KEY,
            thread_key VARCHAR(255),
            assistant_key VARCHAR(255)
        )
    ''')
    db.commit()

# 사용자 유효성 검사 함수
def validate_user(userUID):
    cursor.execute("SELECT thread_key FROM users WHERE useruid = %s", (userUID,))
    result = cursor.fetchone()
    if not result:
        return None
    return result[0]

# OpenAI 메시지 전송 및 응답 처리 함수
def send_message(thread_id, content):
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=content,
    )

def activate_message(thread_id, partner_id):
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=partner_id,
    )
    return run.id

def wait_for_completion(thread_id, run_id):
    while True:
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
        if run.status == "completed":
            break
        time.sleep(0.1)

def list_messages(thread_id):
    messages = client.beta.threads.messages.list(thread_id)
    return messages.data[0].content[0].text.value

# Flask 앱 설정
app = Flask(__name__)
CORS(app)

# 사용자 정보 검증 및 대화 시작
@app.route('/start-conversation', methods=['POST'])
def start_conversation():
    try:
        data = request.get_json()
        userUID = data.get("userUID")
        partner_id = data.get("partner_id")

        if not userUID or not partner_id:
            return jsonify({"error": "userUID와 partner_id는 필수입니다."}), 400

        thread_key = validate_user(userUID)
        if not thread_key:
            return jsonify({"error": "유효하지 않은 사용자입니다."}), 404

        return jsonify({"thread_key": thread_key, "assistant_key": partner_id}), 200
    except Exception as e:
        logging.error(f"Error starting conversation: {e}")
        return jsonify({"error": "서버 오류가 발생했습니다."}), 500

# 감정 분석 및 대화 처리
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_input = data.get("content")
        userUID = data.get("userUID")
        partner_id = data.get("partner_id")

        if not userUID or not user_input or not partner_id:
            return jsonify({"error": "필수 데이터가 누락되었습니다."}), 400

        thread_key = validate_user(userUID)
        if not thread_key:
            return jsonify({"error": "유효하지 않은 사용자입니다."}), 404

        send_message(thread_key, user_input)
        run_id = activate_message(thread_key, partner_id)
        wait_for_completion(thread_key, run_id)
        response = list_messages(thread_key)

        user_emotion = analyze_emotion(user_input)

        return jsonify({"response": response, "user_emotion": user_emotion}), 200
    except Exception as e:
        logging.error(f"Chat error: {e}")
        return jsonify({"error": "서버 오류가 발생했습니다."}), 500

# 연애 코칭 처리
@app.route('/dating-coaching', methods=['POST'])
def dating_coaching():
    try:
        data = request.get_json()
        chat_history = data.get("chat_history", [])

        if not chat_history:
            return jsonify({"error": "대화 기록이 없습니다."}), 400

        # 감정 분석 및 코칭 결과 처리
        
        coaching_response, emotions = process_dating_coaching_with_chat_history(chat_history, emotion_model)

        return jsonify({"response": coaching_response, "emotions": emotions})
    except Exception as e:
        logging.error(f"Error during dating coaching: {e}")
        return jsonify({"error": "연애 코칭 처리 중 오류가 발생했습니다."}), 500

# Flask 서버 실행
if __name__ == '__main__':
    initialize_database()
    app.run(host='0.0.0.0', port=5000, debug=True)
