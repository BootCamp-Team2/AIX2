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

class idealType(BaseModel):
    userUID: str
    myGender: str
    myMBTI: str
    myHeight: str
    favoriteHeight: str
    myAppearance: List[str]
    favoriteAppearance: List[str]
    
def generate_recommend(userIdeal):
    recommend_gender = {
        "남성": "여성",
        "여성": "남성"
    }
    
    recommend_MBTI = {
        "ESTJ": ["ISFP", "ISTP"],
        "ESTP": ["ISFJ", "ISTJ"],
        "ESFJ": ["ISFP", "ISTP"],
        "ESFP": ["ISFJ", "ISTJ"],
        "ENTJ": ["INFP", "INTP"],
        "ENTP": ["INFJ", "INTJ"],
        "ENFJ": ["INFP", "ISFP"],
        "ENFP": ["INFJ", "INTJ"],
        "ISTJ": ["ESFP", "ESTP"],
        "ISTP": ["ESFJ", "ESTJ"],
        "ISFJ": ["ESFP", "ESTP"],
        "ISFP": ["ENFJ", "ESFJ", "ESTJ"],
        "INTJ": ["ENFP", "ENTP"],
        "INTP": ["ENTJ", "ESTJ"],
        "INFJ": ["ENFP", "ENTP"],
        "INFP": ["ENTJ", "ESTJ"],
    }
    
    favorite_Appearance = {
        "상관없음": ["귀여움", "매력적", "활기참", "미소", "단아함", 
                 "청순함", "중성미", "카리스마", "스포티", "패션감각"]
    }
    
    return recommend_gender.get(userIdeal.myGender, ""), recommend_MBTI.get(userIdeal.myMBTI, []), favorite_Appearance.get(userIdeal.favoriteAppearance[0], userIdeal.favoriteAppearance)
    
# MySQL Server 연결
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="AIX2_1234",
        database="idealDatabase"
    )
    
@app.post("/settings/ideal")
def create_or_update_mbti(idealType: idealType):
    # print(f"Received data: userUID={mbti.userUID}, myMBTI={mbti.myMBTI}, recommendMBTI={mbti.recommendMBTI}")
    # print(type(mbti.recommendMBTI))
    conn = get_db_connection()
    cursor = conn.cursor()

    recommendGender, recommendMBTI, favoriteAppearance = generate_recommend(idealType)
    recommendMBTI_json = json.dumps(recommendMBTI)
    myAppearance_JSON = json.dumps(idealType.myAppearance)
    favoriteAppearance_JSON = json.dumps(favoriteAppearance)
    
    try:
        cursor.execute("SELECT * FROM idealTable WHERE userUID = %s", (idealType.userUID, ))
        existing_record = cursor.fetchone()
        
        # userUID 통해서 데이터가 이미 존재한다면, 수정
        if existing_record:
            cursor.execute("""UPDATE idealTable SET myGender = %s, myMBTI = %s, recommendGender = %s, recommendMBTI = %s,
                           myHeight = %s, favoriteHeight = %s, myAppearance = %s, favoriteAppearance = %s WHERE userUID = %s""",
                           (idealType.myGender, idealType.myMBTI, recommendGender, recommendMBTI_json, idealType.myHeight, 
                            idealType.favoriteHeight, myAppearance_JSON, favoriteAppearance_JSON, idealType.userUID))
            message = "Data Updated Successfully"
            
        # 없다면, 생성
        else:
            cursor.execute("""INSERT INTO idealTable (userUID, myGender, myMBTI, recommendGender, recommendMBTI, 
                           myHeight, favoriteHeight, myAppearance, favoriteAppearance) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                           (idealType.userUID, idealType.myGender, idealType.myMBTI, recommendGender, recommendMBTI_json, 
                            idealType.myHeight, idealType.favoriteHeight, myAppearance_JSON, favoriteAppearance_JSON))
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
    uvicorn.run("database:app", host="192.168.1.2", port=8000)