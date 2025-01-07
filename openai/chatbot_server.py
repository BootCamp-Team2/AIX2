from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from chatbot import send_message, activate_message, wait_for_completion, list_messages, get_or_create_thread_and_summary
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# SQLite 데이터베이스 초기화
def init_db():
    conn = sqlite3.connect('users.db')  # 데이터베이스 파일 이름을 일관되게 유지
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        thread_key TEXT
                    )''')
    conn.commit()
    conn.close()

init_db()

# 로그인 페이지
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
        # thread_key가 없는 경우 기본값으로 None 설정
        session['thread_key'] = user[3] if len(user) > 3 and user[3] else None
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

# 챗봇 선택 페이지
@app.route('/select_chatbot', methods=['GET', 'POST'])
def select_chatbot():
    if 'username' not in session:
        return redirect(url_for('login_page'))
    
    if request.method == 'POST':
        selected_chatbot = request.form.get('chatbot')
        thread_key = request.form.get('thread_key')
        
        if thread_key:
            session['thread_key'] = thread_key  # 이전 스레드 키 사용
        else:
            session['thread_key'] = get_or_create_thread_and_summary(session['username'])  # 새로운 스레드 키 생성
        
        if selected_chatbot in ['hana', 'hwarang']:
            session['selected_chatbot'] = selected_chatbot
            return redirect(url_for('chat_page'))
        else:
            return "<h1>Invalid chatbot selection. Please try again.</h1>"

    # Load available thread keys for the user
    conn = sqlite3.connect('users.db')  # 일관된 파일 이름 사용
    cursor = conn.cursor()
    cursor.execute("SELECT thread_key FROM users WHERE username = ?", (session['username'],))
    result = cursor.fetchone()
    conn.close()

    # Handle case where no thread key exists
    thread_keys = [result[0]] if result and result[0] else []

    return render_template('select_chatbot.html', thread_keys=thread_keys)

# 채팅 페이지
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

@app.route('/exit', methods=['POST'])
def exit_chat():
    if 'username' in session:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET thread_key = ? WHERE username = ?", (session.get('thread_key'), session['username']))
        conn.commit()
        conn.close()
    session.pop('selected_chatbot', None)
    session.pop('thread_key', None)
    return redirect(url_for('select_chatbot'))

if __name__ == '__main__':
    app.run(debug=True)