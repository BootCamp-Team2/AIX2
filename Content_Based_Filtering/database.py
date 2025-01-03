import mysql.connector
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MBTI(BaseModel):
    userUID: str
    myMBTI: str
    recommendMBTI: List[str]
    
# MySQL Server 연결
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="AIX2_1234",
        database="myMBTIDatabase"
    )
    
@app.post("/settings/mbti")
def create_or_update_mbti(mbti: MBTI):
    # print(f"Received data: userUID={mbti.userUID}, myMBTI={mbti.myMBTI}, recommendMBTI={mbti.recommendMBTI}")
    # print(type(mbti.recommendMBTI))
    conn = get_db_connection()
    cursor = conn.cursor()
    
    recommendMBTI_json = json.dumps(mbti.recommendMBTI)
    
    try:
        cursor.execute("SELECT * FROM mbtiTable WHERE userUID = %s", (mbti.userUID, ))
        existing_record = cursor.fetchone()
        
        # userUID 통해서 데이터가 이미 존재한다면, 수정
        if existing_record:
            cursor.execute("UPDATE mbtiTable SET myMBTI = %s, recommendMBTI = %s WHERE userUID = %s", (mbti.myMBTI, recommendMBTI_json, mbti.userUID))
            message = "Data Updated Successfully"
            
        # 없다면, 생성
        else:
            cursor.execute("INSERT INTO mbtiTable (userUID, myMBTI, recommendMBTI) VALUES (%s, %s, %s)", (mbti.userUID, mbti.myMBTI, recommendMBTI_json))
            message = "Data Inserted Successfully"
            
        conn.commit()
        return {"message": message}
        
    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error: {e}")
    
    finally:
        cursor.close()
        conn.close()
        
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("database:app", host="127.0.0.1", port=8000)