import sqlite3

# 데이터베이스 연결 (없으면 생성)
db = sqlite3.connect("users.db")

cursor = db.cursor()

# users 테이블 생성 (password 추가)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password TEXT DEFAULT '1234',  -- 기본값 1234
        nickname TEXT,
        thread_key TEXT DEFAULT NULL,  -- 기본값 NULL
        assistant_key TEXT DEFAULT NULL  -- 기본값 NULL
    )
""")

print("Users 테이블이 성공적으로 생성되었습니다.")

# 데이터 삽입 (예제 데이터)
try:
    cursor.execute("""
        INSERT INTO users (nickname)
        VALUES (?)
    """, ('1234',))  # thread_key와 assistant_key는 NULL로 유지
    db.commit()
    print("기본 사용자 데이터가 성공적으로 추가되었습니다.")
except sqlite3.IntegrityError as e:
    print(f"데이터 삽입 중 오류 발생: {e}")

# 데이터베이스 연결 닫기
db.close()
