from flask import Flask, request, jsonify, send_from_directory
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
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            useruid VARCHAR(255),
            thread_key VARCHAR(255),
            assistant_key VARCHAR(255)
        )
    ''')
    db.commit()

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
        time.sleep(2.0)

def list_messages(thread_id):
    messages = client.beta.threads.messages.list(thread_id)
    return messages.data[0].content[0].text.value

def get_partner_id(partner_id):
    """
    어시스턴트 ID를 .env에서 가져오는 함수
    """
    if partner_id.upper() == "HANA":
        partner_id_env = os.getenv("REACT_APP_PARTNER_ID_HANA")
    elif partner_id.upper() == "HWARANG":
        partner_id_env = os.getenv("REACT_APP_PARTNER_ID_HWARANG")
    else:
        raise ValueError(f"Invalid partner_id: {partner_id}")

    if not partner_id_env:
        raise Exception(f"{partner_id}에 대한 어시스턴트 키가 .env 파일에 설정되지 않았습니다.")
    return partner_id_env


# Flask 앱 설정
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '../uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 정적 파일 제공 설정
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 사용자 정보 검증 및 대화 시작
@app.route('/start-conversation', methods=['POST'])
def start_conversation():
    try:
        data = request.get_json()
        userUID = data.get("userUID")
        partner_id = data.get("partner_id")
        ideal_photo = data.get("idealPhoto") or r"love-project\assets\default-profile-male.png"

        if not userUID or not partner_id:
            return jsonify({"error": "userUID와 partner_id는 필수입니다."}), 400

        # 새 스레드 생성
        thread = client.beta.threads.create()
        thread_key = thread.id

        # 스레드와 어시스턴트 키 저장
        cursor.execute('''
            UPDATE users
            SET thread_key = %s, assistant_key = %s
            WHERE useruid = %s
        ''', (thread_key, partner_id, userUID))
        db.commit()

        return jsonify({"thread_key": thread_key, "assistant_key": partner_id, "ideal_photo": ideal_photo}), 200
    except Exception as e:
        logging.error(f"Error starting conversation: {e}")
        return jsonify({"error": "스레드 생성 중 오류가 발생했습니다."}), 500
    
# 스레드 불러오기
@app.route('/get-thread', methods=['POST'])
def get_thread():
    try:
        data = request.get_json()
        userUID = data.get("userUID")

        if not userUID:
            return jsonify({"error": "userUID는 필수입니다."}), 400

        cursor.execute("SELECT thread_key, assistant_key FROM users WHERE useruid = %s", (userUID,))
        result = cursor.fetchone()

        if not result:
            return jsonify({"error": "스레드가 존재하지 않습니다."}), 404

        return jsonify({"thread_key": result[0], "assistant_key": result[1]}), 200
    except Exception as e:
        logging.error(f"Error fetching thread: {e}")
        return jsonify({"error": "스레드 조회 중 오류가 발생했습니다."}), 500

# 감정 분석 및 대화 처리
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        logging.info(f"Received chat data: {data}")

        user_input = data.get("content")
        userUID = data.get("userUID")
        partner_id = data.get("partner_id")
        thread_key = data.get("thread_key")

        if not userUID or not user_input or not partner_id or not thread_key:
            logging.error("필수 데이터 누락.")
            return jsonify({"error": "필수 데이터가 누락되었습니다."}), 400

        # 스레드 키 확인
        cursor.execute("SELECT thread_key FROM users WHERE useruid = %s", (userUID,))
        result = cursor.fetchone()
        if not result or result[0] != thread_key:
            logging.error(f"Invalid thread_key: {thread_key}")
            return jsonify({"error": "유효하지 않은 thread_key입니다."}), 404

        # OpenAI API에서 사용할 실제 어시스턴트 ID 가져오기
        assistant_id = get_partner_id(partner_id)

        # OpenAI 대화 처리
        send_message(thread_key, user_input)
        run_id = activate_message(thread_key, assistant_id)
        wait_for_completion(thread_key, run_id)
        response = list_messages(thread_key)

        return jsonify({"response": response}), 200
    except Exception as e:
        logging.error(f"Chat error: {e}")
        return jsonify({"error": "서버 오류가 발생했습니다."}), 500

@app.route('/chat-history', methods=['POST'])
def chat_history():
    try:
        data = request.get_json()
        thread_key = data.get("threadKey")

        if not thread_key:
            return jsonify({"error": "threadKey is required"}), 400

        # OpenAI API에서 대화 기록 가져오기
        messages = client.beta.threads.messages.list(thread_key)
        
        # JSON 응답 형식 변환
        message_list = []
        for message in messages.data:
            role = "assistant" if message.role == "assistant" else "user"
            content = message.content[0].text.value  # 메시지의 텍스트 추출
            message_list.append({"role": role, "content": content})

        # 오래된 순으로 정렬
        message_list.reverse()

        return jsonify({"messages": message_list}), 200
    except Exception as e:
        logging.error(f"Error fetching chat history: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/uploads/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    """업로드된 파일 반환"""
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except FileNotFoundError:
        logging.error(f"File not found: {filename}")
        return jsonify({"error": "File not found"}), 404

@app.route('/upload-ideal-photo', methods=['POST'])
def upload_ideal_photo():
    try:
        file = request.files['file']
        if not file:
            return jsonify({"error": "No file provided"}), 400

        # 파일 저장 경로 설정
        filename = f"ideal-photo-{int(time.time())}.jpg"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        return jsonify({"message": "File uploaded successfully", "file_path": f"uploads/{filename}"}), 200
    except Exception as e:
        logging.error(f"Error uploading file: {e}")
        return jsonify({"error": str(e)}), 500

# 연애 코칭 처리
@app.route('/dating-coaching', methods=['POST'])
def dating_coaching():
    try:
        data = request.get_json()
        chat_history = data.get("chat_history", [])

        if not chat_history:
            return jsonify({"error": "대화 기록이 없습니다."}), 400

        # 감정 분석 및 코칭 결과 처리
        coaching_response, emotions = process_dating_coaching_with_chat_history(
            chat_history, emotion_model, client, send_message, activate_message, wait_for_completion, list_messages
        )

        return jsonify({"response": coaching_response, "emotions": emotions})
    except Exception as e:
        logging.error(f"Error during dating coaching: {e}")
        return jsonify({"error": "연애 코칭 처리 중 오류가 발생했습니다."}), 500

# Flask 서버 실행
if __name__ == '__main__':
    initialize_database()
    app.run(host='0.0.0.0', port=5000, debug=True)
