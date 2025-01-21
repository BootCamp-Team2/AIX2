import sqlite3

# 데이터베이스 연결 및 생성
conn = sqlite3.connect('users.db')
cursor = conn.cursor()

# 테이블 생성
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    thread_key TEXT,
    chatbot_id TEXT
)
''')

print("users.db가 성공적으로 생성되었습니다.")

# 연결 종료
conn.close()
