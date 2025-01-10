import sqlite3
import logging
from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import time
from chatbot import client, send_message, activate_message, wait_for_completion, list_messages, create_and_save_thread, get_thread_and_chatbot_from_db
from analyzing_emotion import initialize_emotion_model
from dating_coaching_handler import process_dating_coaching_with_chat_history

# .env 파일 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default_secret_key")

# SQLite 데이터베이스 초기화
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        thread_key TEXT,
                        chatbot_id TEXT
                    )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def login_page():
    if 'username' in session:
        return redirect(url_for('select_chatbot'))
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[2], password):
        session['username'] = username
        session['thread_key'] = user[3] if len(user) > 3 and user[3] else None
        session['selected_chatbot'] = user[4] if len(user) > 4 and user[4] else None
        return redirect(url_for('select_chatbot'))
    else:
        return "<h1>로그인 실패! 다시 시도하세요.</h1>"

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])

        try:
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
            conn.commit()
            conn.close()
            return redirect(url_for('login_page'))
        except Exception as e:
            return f"<h1>회원가입 실패: {e}</h1>"
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('selected_chatbot', None)
    session.pop('thread_key', None)
    return redirect(url_for('login_page'))

@app.route('/select_chatbot', methods=['GET', 'POST'])
def select_chatbot():
    if 'username' not in session:
        return redirect(url_for('login_page'))

    if request.method == 'POST':
        thread_key = request.form.get('thread_key')

        # 기존 스레드 로드 시 데이터베이스에서 chatbot_id를 불러옴
        if thread_key:
            session['thread_key'] = thread_key
            _, session['selected_chatbot'] = get_thread_and_chatbot_from_db(session['username'])
        else:
            # 새 스레드 생성
            selected_chatbot = request.form.get('chatbot', 'hana')  # 기본값 설정
            session['thread_key'] = create_and_save_thread(session['username'], selected_chatbot)
            session['selected_chatbot'] = selected_chatbot

        return redirect(url_for('chat_page'))

    # 기존 스레드 키 불러오기
    thread_key, chatbot_id = get_thread_and_chatbot_from_db(session['username'])
    session['selected_chatbot'] = chatbot_id  # DB에서 가져온 chatbot_id 설정

    return render_template('select_chatbot.html', thread_keys=[thread_key] if thread_key else [])

@app.route('/chat')
def chat_page():
    if 'username' not in session or 'selected_chatbot' not in session:
        return redirect(url_for('login_page'))
    return render_template('chat.html')

@app.route('/chat/api', methods=['POST'])
def chat_api():
    user_message = request.json.get('message')
    selected_assistant = session.get('selected_chatbot')
    thread_key = session.get('thread_key')

    if not user_message or not selected_assistant or not thread_key:
        return jsonify({'error': 'No message, assistant, or thread provided'}), 400

    # 세션에 사용자 메시지 저장
    if 'chat_history' not in session:
        session['chat_history'] = []
    session['chat_history'].append(user_message)

    try:
        if selected_assistant == "hana":
            partner_id = os.getenv("REACT_APP_PARTNER_ID_HANA")
        elif selected_assistant == "hwarang":
            partner_id = os.getenv("REACT_APP_PARTNER_ID_HWARANG")
        else:
            return jsonify({'error': 'Invalid assistant selected'}), 400

        send_message(thread_key, user_message)
        run_id = activate_message(thread_key, partner_id)
        wait_for_completion(thread_key, run_id)
        partner_response = list_messages(thread_key)

        return jsonify({'response': partner_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 감정 분석 모델 초기화
emotion_model = initialize_emotion_model()

@app.route('/dating_coaching', methods=['GET'])
def dating_coaching():
    if 'username' not in session:
        return redirect(url_for('login_page'))

    try:
        # 세션에서 채팅 기록 가져오기
        chat_history = session.get('chat_history', [])
        if not chat_history:
            raise ValueError("채팅 기록이 없습니다.")

        # 연애 코칭 요청 생성
        coaching_response, emotion_results = process_dating_coaching_with_chat_history(chat_history, emotion_model)

        return render_template(
            'dating_coaching.html',
            coaching_response=coaching_response,
            emotions=emotion_results
        )
    except ValueError as ve:
        logging.error(f"ValueError: {ve}")
        return f"<h1>오류 발생: {ve}</h1>", 400
    except RuntimeError as re:
        logging.error(f"RuntimeError: {re}")
        return f"<h1>연애 코칭 중 오류 발생: {re}</h1>", 500

@app.route('/exit', methods=['POST'])
def exit_chat():
    if 'username' in session:
        # 애인 챗봇 스레드 키 저장
        if 'thread_key' in session and session['thread_key']:
            try:
                conn = sqlite3.connect('users.db')
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE users SET thread_key = ? WHERE username = ?",
                    (session['thread_key'], session['username'])
                )
                conn.commit()
                conn.close()
            except Exception as e:
                logging.error(f"Error updating thread_key in database: {e}")
                return jsonify({'error': 'Failed to update database'}), 500

        # 세션에서 애인 챗봇 데이터 제거
        session.pop('selected_chatbot', None)
        session.pop('thread_key', None)

        # 연애 코칭 스레드 키 생성
        if 'coaching_thread_key' not in session:
            thread = client.beta.threads.create()
            session['coaching_thread_key'] = thread.id

    return jsonify({'message': 'Chat session ended successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
