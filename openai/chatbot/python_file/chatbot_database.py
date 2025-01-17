import sqlite3
import logging
import uuid

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 데이터베이스 초기화 함수
def init_db():
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT,
                thread_key TEXT
            )
        ''')
        conn.commit()
        conn.close()
        logging.info("데이터베이스가 초기화되었습니다.")
    except Exception as e:
        logging.error("데이터베이스 초기화 중 오류 발생: %s", e)
        raise

# 사용자 ID 생성 함수
def create_user():
    try:
        new_id = str(uuid.uuid4())[:6].upper()  # 6자리 고유 ID 생성
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (id) VALUES (?)', (new_id,))
        conn.commit()
        conn.close()
        logging.info(f"새 사용자 ID 생성: {new_id}")
        return new_id
    except Exception as e:
        logging.error("사용자 ID 생성 중 오류 발생: %s", e)
        raise

# 사용자 ID 검증 함수
def validate_user(user_id):
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        result = cursor.fetchone()
        conn.close()
        if result:
            logging.info(f"사용자 ID {user_id} 검증 성공.")
            return True
        else:
            logging.warning(f"사용자 ID {user_id} 존재하지 않음.")
            return False
    except Exception as e:
        logging.error("사용자 검증 중 오류 발생: %s", e)
        raise

# 사용자 ID로 데이터베이스에서 username과 thread_id 가져오기
def get_user_info(user_id):
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, thread_key FROM users WHERE id = ?", (user_id,))
        result = cursor.fetchone()
        conn.close()
        if result:
            return result[0], result[1]
        else:
            raise ValueError("사용자 ID를 찾을 수 없습니다.")
    except Exception as e:
        logging.error("사용자 정보를 가져오는 중 오류 발생: %s", e)
        raise

# 스레드 생성 함수
def create_thread(user_id):
    try:
        new_thread_key = str(uuid.uuid4())  # 새 스레드 키 생성
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET thread_key = ? WHERE id = ?", (new_thread_key, user_id))
        conn.commit()
        conn.close()
        logging.info(f"새 스레드 생성: User ID {user_id}, Thread Key {new_thread_key}")
        return new_thread_key
    except Exception as e:
        logging.error("스레드 생성 중 오류 발생: %s", e)
        raise

# 스레드 조회 함수
def get_thread(user_id):
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("SELECT thread_key FROM users WHERE id = ?", (user_id,))
        result = cursor.fetchone()
        conn.close()
        if result and result[0]:
            logging.info(f"스레드 조회 성공: User ID {user_id}, Thread Key {result[0]}")
            return result[0]
        else:
            raise ValueError("스레드 키를 찾을 수 없습니다.")
    except Exception as e:
        logging.error("스레드 조회 중 오류 발생: %s", e)
        raise

if __name__ == "__main__":
    init_db()
